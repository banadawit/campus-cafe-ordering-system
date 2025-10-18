import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Clock, CheckCircle, Coins, ShoppingCart, BarChart3, Calendar } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OrderRow = {
  id: number;
  status: "pending" | "completed";
  created_at: string;
};

type OrdersPerDay = { date: string; count: number };

type TopItem = { name: string; count: number };

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

const formatDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    ...(new Date().getFullYear() !== date.getFullYear() && { year: '2-digit' })
  });
};

const startOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

  // Enhanced chart data with formatted dates for better mobile display
  const formattedOrdersPerDay = useMemo(() => 
    ordersPerDay.map(item => ({
      ...item,
      formattedDate: formatDateDisplay(item.date)
    })), [ordersPerDay]);

  const rangeLabels = {
    today: "Today",
    week: "Last 7 Days", 
    month: "Last 30 Days"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time insights into your order performance
          </p>
        </div>
        <div className="w-full sm:w-44">
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="h-10">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Time Range" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{totalOrders}</div>
            <div className={`text-xs flex items-center gap-1 mt-2 ${
              growthOrdersPct >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {growthOrdersPct >= 0 ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />
              }
              {Math.round(Math.abs(growthOrdersPct))}% vs previous period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              ETB {revenue.toFixed(2)}
            </div>
            <div className={`text-xs flex items-center gap-1 mt-2 ${
              growthRevenuePct >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {growthRevenuePct >= 0 ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />
              }
              {Math.round(Math.abs(growthRevenuePct))}% vs previous period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              ETB {avgOrderValue.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Completed orders only</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                {statusCounts.completed} Completed
              </Badge>
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-yellow-300 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                {statusCounts.pending} Pending
              </Badge>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Orders Over Time Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Orders Over Time
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {rangeLabels[range]}
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ orders: { label: "Orders", color: "hsl(var(--primary))" } }}
              className="h-[300px] sm:h-[260px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedOrdersPerDay}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    interval={range === 'month' ? 6 : range === 'week' ? 1 : 0}
                    angle={range === 'month' ? -45 : 0}
                    height={range === 'month' ? 60 : 40}
                  />
                  <YAxis allowDecimals={false} width={35} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value} orders`, 'Orders']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--color-orders)" 
                    strokeWidth={3}
                    dot={{ fill: "var(--color-orders)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ 
                completed: { label: "Completed", color: "#22c55e" }, 
                pending: { label: "Pending", color: "#f59e0b" } 
              }}
              className="h-[300px] sm:h-[260px] flex items-center justify-center"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    nameKey="name"
                    data={[
                      { name: "Completed", value: statusCounts.completed, fill: "#22c55e" },
                      { name: "Pending", value: statusCounts.pending, fill: "#f59e0b" },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${value} orders`, name]}
                  />
                  <ChartLegend 
                    content={<ChartLegendContent />}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Items Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Most Popular Items</CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on order frequency in the selected period
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{ count: { label: "Orders", color: "hsl(var(--primary))" } }} 
            className="h-[300px] sm:h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis allowDecimals={false} width={35} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value} orders`, 'Count']}
                  labelFormatter={(label) => `Item: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--color-count)" 
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Mobile Summary Cards */}
      <div className="lg:hidden space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Period</span>
              <Badge variant="secondary">{rangeLabels[range]}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="font-semibold">
                {totalOrders > 0 ? Math.round((statusCounts.completed / totalOrders) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg. Daily Orders</span>
              <span className="font-semibold">
                {range === 'today' ? totalOrders : Math.round(totalOrders / (range === 'week' ? 7 : 30))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;