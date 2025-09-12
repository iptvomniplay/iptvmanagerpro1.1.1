import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Server,
  Users,
  PlusCircle,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { clients, servers } from '@/lib/data';

export default function Dashboard() {
  const clientImage = PlaceHolderImages.find(
    (img) => img.id === 'dashboard-clients'
  );
  const serverImage = PlaceHolderImages.find(
    (img) => img.id === 'dashboard-servers'
  );
  const onlineServers = servers.filter(
    (server) => server.status === 'Online'
  ).length;
  const totalClients = clients.length;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Servers Online
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {onlineServers} / {servers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Subscriptions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+25</div>
            <p className="text-xs text-muted-foreground">
              +12.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              High CPU load on Server 2
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-fr gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Welcome to IPTV Manager Pro</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                Your central hub for managing clients and servers. Streamline
                your operations and get a clear overview of your IPTV network.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/clients">
                  Manage Clients <PlusCircle />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Configure Servers</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                Use our AI-powered tool to validate server parameters for
                optimal performance.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/servers/configure">
                  Validate Configuration <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Quick Management
              </CardTitle>
              <CardDescription>
                Quickly access client and server management pages.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-8 p-6 sm:grid-cols-2">
            <div className="group relative">
              {clientImage && (
                <Image
                  src={clientImage.imageUrl}
                  alt={clientImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={clientImage.imageHint}
                  className="rounded-lg object-cover transition-transform group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 rounded-lg bg-black/40" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white">Clients</h3>
                <p className="text-sm text-white/90">View and manage all your clients</p>
                <Button asChild size="sm" className="mt-2">
                  <Link href="/clients">
                    Go to Clients <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="group relative">
              {serverImage && (
                <Image
                  src={serverImage.imageUrl}
                  alt={serverImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={serverImage.imageHint}
                  className="rounded-lg object-cover transition-transform group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 rounded-lg bg-black/40" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white">Servers</h3>
                <p className="text-sm text-white/90">Monitor server status and configuration</p>
                 <Button asChild size="sm" className="mt-2">
                  <Link href="/servers">
                    Go to Servers <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
