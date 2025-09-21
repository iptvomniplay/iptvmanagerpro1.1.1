
'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import { SelectedReportsState, reportConfig, ReportKey } from '../components/report-modal';
import { add, format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from '@/components/theme-provider';

type GeneratedReportData = {
  title: string;
  headers: string[];
  rows: string[][];
};

const ReportPageContent = () => {
    const { t } = useLanguage();
    const { clients, servers } = useData();
    const [reports, setReports] = React.useState<GeneratedReportData[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const storedConfigsRaw = sessionStorage.getItem('reportConfigs');
        if (!storedConfigsRaw) {
            setIsLoading(false);
            return;
        }

        try {
            const selectedConfigs: SelectedReportsState = JSON.parse(storedConfigsRaw);
            const generatedReports: GeneratedReportData[] = [];

            Object.entries(selectedConfigs).forEach(([key, config]) => {
                const reportKey = key as ReportKey;
                if (!config) return;
                const reportMeta = reportConfig[reportKey];
                const selectedFields = Object.keys(config.fields).filter(fieldKey => config.fields[fieldKey as keyof typeof config.fields]);

                if (selectedFields.length === 0) return;

                const headers = selectedFields.map(fieldKey => t(reportMeta.fields[fieldKey as keyof typeof reportMeta.fields]));
                let rows: string[][] = [];

                switch (reportKey) {
                    case 'clientList':
                    rows = clients.map(client =>
                        selectedFields.map(field => {
                        switch (field) {
                            case 'fullName': return client.name;
                            case 'clientId': return client.id || t('noId');
                            case 'status': return t(client.status.toLowerCase());
                            case 'registeredDate': return client.registeredDate ? format(new Date(client.registeredDate), 'dd/MM/yyyy') : '';
                            case 'contact': return client.phones.map(p => p.number).join(', ');
                            default: return '';
                        }
                        })
                    );
                    break;
                    case 'expiredSubscriptions':
                        const expiredClients = clients.filter(c => c.status === 'Expired');
                        rows = expiredClients.map(client =>
                            selectedFields.map(field => {
                                const lastPlan = client.plans && client.plans.length > 0 ? client.plans[client.plans.length - 1] : null;
                                switch (field) {
                                    case 'fullName': return client.name;
                                    case 'lastPlan': return lastPlan?.plan.name || 'N/A';
                                    case 'expirationDate': return client.expirationDate ? format(new Date(client.expirationDate), 'dd/MM/yyyy') : 'N/A';
                                    case 'contact': return client.phones.map(p => p.number).join(', ');
                                    default: return '';
                                }
                            })
                        );
                        break;
                    case 'activeTests':
                        const allTests = clients.flatMap(client =>
                            (client.tests || []).map(test => ({ client, test }))
                        );
                        rows = allTests.map(({ client, test }) =>
                            selectedFields.map(field => {
                                switch (field) {
                                    case 'clientName': return client.name;
                                    case 'testPackage': return test.package;
                                    case 'startTime': return format(new Date(test.creationDate), 'dd/MM/yyyy HH:mm');
                                    case 'endTime':
                                        const expiration = add(new Date(test.creationDate), { [test.durationUnit]: test.durationValue });
                                        return format(expiration, 'dd/MM/yyyy HH:mm');
                                    default: return '';
                                }
                            })
                        );
                        break;
                    case 'creditBalance':
                        rows = servers.map(server =>
                            selectedFields.map(field => {
                                switch (field) {
                                    case 'panelName': return server.name;
                                    case 'currentBalance': return String(server.creditStock || 0);
                                    case 'paymentMethod': return t(server.paymentType);
                                    default: return '';
                                }
                            })
                        );
                        break;
                }
                
                generatedReports.push({ title: t(reportMeta.label), headers, rows });
            });

            setReports(generatedReports);
        } catch (error) {
            console.error("Failed to parse report configs:", error);
        } finally {
            setIsLoading(false);
        }
    }, [clients, servers, t]);
    
    React.useEffect(() => {
        if (!isLoading && reports.length > 0) {
            setTimeout(() => {
                window.print();
            }, 500); // Small delay to ensure content is rendered
        }
    }, [isLoading, reports]);


    if (isLoading) {
        return <div className="p-10 text-center">{t('loadingReport')}...</div>;
    }

    if (reports.length === 0) {
        return <div className="p-10 text-center">{t('noDataForReport')}</div>;
    }

    return (
        <div className="p-6 space-y-8 report-content bg-background text-foreground">
            {reports.map((report, index) => (
            <div key={index} style={{ pageBreakInside: 'avoid', pageBreakAfter: index < reports.length - 1 ? 'always' : 'auto' }}>
                <h1 className="text-2xl font-bold mb-4">{report.title}</h1>
                {report.rows.length > 0 ? (
                <div className="rounded-lg border">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        {report.headers.map((header, hIndex) => (
                            <TableHead key={hIndex} className="bg-muted/50">{header}</TableHead>
                        ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report.rows.map((row, rIndex) => (
                        <TableRow key={rIndex}>
                            {row.map((cell, cIndex) => (
                            <TableCell key={cIndex}>{cell}</TableCell>
                            ))}
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                ) : (
                <p className="text-muted-foreground">{t('noDataForReport')}</p>
                )}
                {index < reports.length - 1 && <Separator className="mt-8" />}
            </div>
            ))}
        </div>
    );
};

// This is a new page, so it needs its own layout shell (or lack thereof).
export default function ReportPage() {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <style jsx global>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .report-content {
                        padding: 0;
                    }
                }
            `}</style>
            <ReportPageContent />
        </ThemeProvider>
    );
}
