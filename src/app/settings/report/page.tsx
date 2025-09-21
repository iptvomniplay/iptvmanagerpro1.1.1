
'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import { SelectedReportsState, reportConfig, ReportKey, FieldKey } from '../components/report-modal';
import { add, format, isFuture, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

type GeneratedReportData = {
  title: string;
  headers: string[];
  rows: string[][];
};

const ReportContent = React.forwardRef<HTMLDivElement>((props, ref) => {
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
                if (!config || !config.fields) return;

                const reportMeta = reportConfig[reportKey];
                const selectedFields = Object.keys(config.fields).filter(fieldKey => config.fields[fieldKey as FieldKey<typeof reportKey>]) as FieldKey<typeof reportKey>[];

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
                                return (() => {
                                    switch (field) {
                                        case 'fullName': return client.name;
                                        case 'lastPlan': return lastPlan?.plan.name || 'N/A';
                                        case 'expirationDate': return client.expirationDate ? format(new Date(client.expirationDate), 'dd/MM/yyyy') : 'N/A';
                                        case 'contact': return client.phones.map(p => p.number).join(', ');
                                        default: return '';
                                    }
                                })();
                            })
                        );
                        break;
                    case 'activeTests':
                         const allTests = clients.flatMap(client =>
                            (client.tests || []).map(test => ({ client, test }))
                        ).filter(({ test }) => {
                             const expirationDate = add(parseISO(test.creationDate), { [test.durationUnit]: test.durationValue });
                             return isFuture(expirationDate);
                        });
                        rows = allTests.map(({ client, test }) =>
                            selectedFields.map(field => {
                                return (() => {
                                    switch (field) {
                                        case 'clientName': return client.name;
                                        case 'testPackage': return test.package;
                                        case 'startTime': return format(new Date(test.creationDate), 'dd/MM/yyyy HH:mm');
                                        case 'endTime':
                                            const expiration = add(new Date(test.creationDate), { [test.durationUnit]: test.durationValue });
                                            return format(expiration, 'dd/MM/yyyy HH:mm');
                                        default: return '';
                                    }
                                })();
                            })
                        );
                        break;
                    case 'creditBalance':
                        rows = servers.map(server =>
                            selectedFields.map(field => {
                                return (() => {
                                    switch (field) {
                                        case 'panelName': return server.name;
                                        case 'currentBalance': return String(server.creditStock || 0);
                                        case 'paymentMethod': return t(server.paymentType as any);
                                        default: return '';
                                    }
                                })();
                            })
                        );
                        break;
                }
                
                generatedReports.push({ title: t(reportMeta.label as any), headers, rows });
            });

            setReports(generatedReports);
        } catch (error) {
            console.error("Failed to parse report configs:", error);
        } finally {
            setIsLoading(false);
        }
    }, [clients, servers, t]);
    
    if (isLoading) {
        return <div className="p-10 text-center">{t('loadingReport')}...</div>;
    }

    return (
        <div ref={ref} className="p-8 report-container">
             {reports.length > 0 ? (
                <div className="space-y-8 report-content">
                    {reports.map((report, index) => (
                        <div key={index} className="page-break">
                            <h2 className="text-xl font-semibold mb-4">{report.title}</h2>
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
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                     <p className="text-lg text-muted-foreground">{t('noDataForReport')}</p>
                </div>
            )}
        </div>
    );
});
ReportContent.displayName = 'ReportContent';


export default function ReportPage() {
    const { t } = useLanguage();
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
        const timer = setTimeout(() => {
            window.print();
        }, 1000); // Wait 1 second for data to render before printing

        return () => clearTimeout(timer);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="print-header p-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('generatedReport')}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.close()}>{t('close')}</Button>
                    <Button onClick={() => window.print()}>{t('print')}</Button>
                </div>
            </div>
            <ReportContent />
            <style jsx global>{`
                @media print {
                    .print-header {
                        display: none;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .report-container {
                        padding: 1cm;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                }
            `}</style>
        </ThemeProvider>
    );
}

