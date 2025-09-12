import { servers } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PlusCircle, Settings } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ServersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Server Management
          </h1>
          <p className="text-muted-foreground">
            Monitor server status and manage configurations.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Register Server
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {servers.map((server) => (
          <Card key={server.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{server.name}</CardTitle>
                <Badge
                  variant={
                    server.status === 'Online' ? 'default' : 'destructive'
                  }
                  className="flex items-center gap-2"
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      server.status === 'Online'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    )}
                  />
                  {server.status}
                </Badge>
              </div>
              <CardDescription>{server.url}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">Connections</span>
                  <span className="text-muted-foreground">
                    {server.connections} / {server.maxConnections}
                  </span>
                </div>
                <Progress
                  value={(server.connections / server.maxConnections) * 100}
                />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">CPU Load</span>
                  <span className="text-muted-foreground">
                    {server.cpuLoad}%
                  </span>
                </div>
                <Progress
                  value={server.cpuLoad}
                  className={cn(
                    server.cpuLoad > 90
                      ? '[&>div]:bg-destructive'
                      : server.cpuLoad > 75
                      ? '[&>div]:bg-yellow-500'
                      : ''
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/servers/configure">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
