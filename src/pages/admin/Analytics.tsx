import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Clock, CheckCircle, Coins } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OrderRow = {
  id: number;
  status: "pending" | "completed";
  created_at: string;
};

type OrdersPerDay = { date: string; count: number };

type TopItem = { name: string; count: number };

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

const startOfWeek = () => {
  const d = new Date();
  const day = d.getDay(); // 0..6
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  const res = new Date(d.setDate(diff));
  res.setHours(0, 0, 0, 0);
  return res;
};

type Range = "today" | "week" | "month";

const addDays = (d: Date, days: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
};

const rangeWindow = (range: Range) => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  let lengthDays = 1;
  if (range === "week") lengthDays = 7;
  if (range === "month") lengthDays = 30;
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (lengthDays - 1));
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(lengthDays - 1));
  return { from, to: now, prevFrom, prevTo, lengthDays };
};

const Analytics = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersPerDay, setOrdersPerDay] = useState<OrdersPerDay[]>([]);
  const [statusCounts, setStatusCounts] = useState<{ completed: number; pending: number }>({ completed: 0, pending: 0 });
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [revenue, setRevenue] = useState<number>(0);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<Range>("week");
  const [growthOrdersPct, setGrowthOrdersPct] = useState<number>(0);
  const [growthRevenuePct, setGrowthRevenuePct] = useState<number>(0);

  const refresh = async () => {
    try {
      const { from, to, prevFrom, prevTo, lengthDays } = rangeWindow(range);

      // Pull current+previous window for comparisons
      const { data: o, error: oe } = await supabase
        .from("orders")
        .select("id, status, created_at")
        .gte("created_at", prevFrom.toISOString())
        .lte("created_at", to.toISOString())
        .order("created_at", { ascending: true });
      if (oe) throw oe;
      const all = (o as OrderRow[]) || [];
      const inRange = all.filter((x) => {
        const d = new Date(x.created_at);
        return d >= from && d <= to;
      });
      setOrders(inRange);

      // Status counts
      const c = (inRange || []).reduce(
        (acc, it) => {
          if (it.status === "completed") acc.completed += 1;
          if (it.status === "pending") acc.pending += 1;
          return acc;
        },
        { completed: 0, pending: 0 },
      );
      setStatusCounts(c);

      // Orders per day (respect selected range)
      const byDay = new Map<string, number>();
      for (let i = lengthDays - 1; i >= 0; i--) {
        const d = new Date(to);
        d.setDate(to.getDate() - i);
        byDay.set(fmtDate(d), 0);
      }
      (inRange || []).forEach((it) => {
        const key = fmtDate(new Date(it.created_at));
        if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + 1);
      });
      setOrdersPerDay(Array.from(byDay.entries()).map(([date, count]) => ({ date, count })));

      // Revenue: sum (current window)
      const completedIds = (inRange || []).filter((x) => x.status === "completed").map((x) => x.id);
      let total = 0;
      if (completedIds.length > 0) {
        const { data: items, error: ie } = await supabase
          .from("order_items")
          .select("order_id, quantity, price_at_time")
          .in("order_id", completedIds);
        if (ie) throw ie;
        total = (items || []).reduce((sum, it) => sum + Number(it.price_at_time) * Number(it.quantity), 0);
      }
      setRevenue(total);
      setAvgOrderValue(completedIds.length > 0 ? total / completedIds.length : 0);

      // Growth comparisons against previous window
      const prevRangeOrders = all.filter((x) => {
        const d = new Date(x.created_at);
        return d >= prevFrom && d <= prevTo;
      });
      const prevCompletedIds = prevRangeOrders.filter((x) => x.status === "completed").map((x) => x.id);
      let prevRevenue = 0;
      if (prevCompletedIds.length > 0) {
        const { data: pItems } = await supabase
          .from("order_items")
          .select("order_id, quantity, price_at_time")
          .in("order_id", prevCompletedIds);
        prevRevenue = (pItems || []).reduce((sum, it) => sum + Number(it.price_at_time) * Number(it.quantity), 0);
      }
      const ordersNow = inRange.length;
      const ordersPrev = prevRangeOrders.length || 0;
      const revPrev = prevRevenue || 0;
      setGrowthOrdersPct(ordersPrev === 0 ? (ordersNow > 0 ? 100 : 0) : ((ordersNow - ordersPrev) / ordersPrev) * 100);
      setGrowthRevenuePct(revPrev === 0 ? (total > 0 ? 100 : 0) : ((total - revPrev) / revPrev) * 100);

      // Top 5 items by frequency (last 14 days)
      const { data: tops, error: te } = await supabase
        .from("order_items")
        .select("food(name)")
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString())
        .limit(2000);
      if (te) throw te;
      const counts = new Map<string, number>();
      (tops || []).forEach((row: any) => {
        const name = row.food?.name ?? "Unknown";
        counts.set(name, (counts.get(name) || 0) + 1);
      });
      const top = Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopItems(top);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [range]);

  const totalOrders = orders.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <div className="w-44">
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger>
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Total Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {growthOrdersPct >= 0 ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
              {Math.round(Math.abs(growthOrdersPct))}% vs prev
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Coins className="h-4 w-4" /> Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">ETB {revenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {growthRevenuePct >= 0 ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
              {Math.round(Math.abs(growthRevenuePct))}% vs prev
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Average Order Value</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">ETB {avgOrderValue.toFixed(2)}</div><div className="text-xs text-muted-foreground">Completed orders only</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge className="bg-secondary text-secondary-foreground"><CheckCircle className="h-3 w-3 mr-1" /> {statusCounts.completed} Completed</Badge>
              <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> {statusCounts.pending} Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader><CardTitle>Orders ({range === "today" ? "today" : range === "week" ? "last 7 days" : "last 30 days"})</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer
              config={{ orders: { label: "Orders", color: "hsl(var(--primary))" } }}
              className="h-[260px]"
            >
              <LineChart data={ordersPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="var(--color-orders)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Completed vs Pending</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer
              config={{ completed: { label: "Completed", color: "#22c55e" }, pending: { label: "Pending", color: "#f59e0b" } }}
              className="h-[260px] items-center"
            >
              <PieChart margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <Pie
                  dataKey="value"
                  nameKey="name"
                  data={[
                    { name: "Completed", value: statusCounts.completed, fill: "#22c55e" },
                    { name: "Pending", value: statusCounts.pending, fill: "#f59e0b" },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  labelLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader><CardTitle>Top 5 Items</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: "Orders", color: "hsl(var(--primary))" } }} className="h-[260px]">
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} height={50} />
                <YAxis allowDecimals={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;


