import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Download, IndianRupee, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useGetEarnings } from "../hooks/useQueries";

const WEEKLY_DATA = [
  { day: "Mon", date: "Mar 11", trips: 8, earnings: 1200, distance: 84.2 },
  { day: "Tue", date: "Mar 12", trips: 12, earnings: 1800, distance: 118.6 },
  { day: "Wed", date: "Mar 13", trips: 6, earnings: 980, distance: 67.3 },
  { day: "Thu", date: "Mar 14", trips: 14, earnings: 2100, distance: 142.5 },
  { day: "Fri", date: "Mar 15", trips: 11, earnings: 1640, distance: 108.9 },
  { day: "Sat", date: "Mar 16", trips: 15, earnings: 2200, distance: 154.3 },
  { day: "Sun", date: "Mar 17", trips: 9, earnings: 1320, distance: 93.8 },
];

const MONTHLY_SUMMARY = [
  { month: "March 2026", trips: 76, earnings: 11240, status: "current" },
  { month: "February 2026", trips: 198, earnings: 29850, status: "paid" },
  { month: "January 2026", trips: 214, earnings: 32400, status: "paid" },
  { month: "December 2025", trips: 187, earnings: 28100, status: "paid" },
];

export function EarningsPage() {
  const { data: earnings } = useGetEarnings();
  const weeklyData = earnings?.weeklyEarnings
    ? WEEKLY_DATA.map((d, i) => ({
        ...d,
        earnings: earnings.weeklyEarnings[i] ?? d.earnings,
      }))
    : WEEKLY_DATA;

  const total = weeklyData.reduce((s, d) => s + d.earnings, 0);
  const maxEarning = Math.max(...weeklyData.map((d) => d.earnings));
  const todayEarnings = earnings?.todayEarnings ?? 1840;
  const totalTrips = weeklyData.reduce((s, d) => s + d.trips, 0);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Earnings
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your weekly and monthly income
            </p>
          </div>
          <Button
            data-ocid="earnings.download.button"
            variant="outline"
            className="gap-2 border-border text-muted-foreground"
          >
            <Download size={15} /> Export
          </Button>
        </div>
      </motion.div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Today",
            value: `₹${todayEarnings.toLocaleString("en-IN")}`,
            sub: `${earnings?.totalTrips ?? 7} trips`,
            color: "text-primary",
          },
          {
            label: "This Week",
            value: `₹${total.toLocaleString("en-IN")}`,
            sub: `${totalTrips} trips`,
            color: "text-primary",
          },
          {
            label: "This Month",
            value: "₹11,240",
            sub: "76 trips",
            color: "text-success",
          },
          {
            label: "All Time",
            value: "₹1,52,830",
            sub: "1,243 trips",
            color: "text-chart-3",
          },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-glow rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {c.label}
            </p>
            <p className={`text-2xl font-extrabold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glow rounded-2xl border border-border bg-card p-6"
          data-ocid="earnings.chart.panel"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Weekly Breakdown
              </h2>
              <p className="text-xs text-muted-foreground">
                Mar 11 – Mar 17, 2026
              </p>
            </div>
            <Badge
              className="bg-primary/20 text-primary border-primary/30"
              variant="outline"
            >
              <TrendingUp size={11} className="mr-1" /> +12%
            </Badge>
          </div>

          {/* Chart */}
          <div className="flex items-end justify-between gap-3 h-40 mb-4">
            {weeklyData.map((d, i) => {
              const pct = maxEarning > 0 ? (d.earnings / maxEarning) * 100 : 0;
              const isToday = i === new Date().getDay() - 1;
              return (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-[10px] text-muted-foreground font-medium">
                    ₹{(d.earnings / 100).toFixed(0)}k
                  </span>
                  <div
                    className="w-full flex items-end"
                    style={{ height: "100px" }}
                  >
                    <div
                      className={`w-full rounded-t-lg bar-animate ${
                        isToday
                          ? "bg-primary shadow-lg shadow-primary/30"
                          : "bg-primary/35 hover:bg-primary/60"
                      } transition-colors cursor-pointer`}
                      style={{ height: `${Math.max(pct, 6)}%` }}
                      title={`${d.day}: ₹${d.earnings}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {d.day}
                  </span>
                  {isToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-border pt-3 flex justify-between text-xs text-muted-foreground">
            <span>
              Total:{" "}
              <span className="text-primary font-bold">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </span>
            <span>
              Avg/day:{" "}
              <span className="text-foreground font-semibold">
                ₹{Math.round(total / 7).toLocaleString("en-IN")}
              </span>
            </span>
          </div>
        </motion.div>

        {/* Monthly summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-glow rounded-2xl border border-border bg-card p-6"
          data-ocid="earnings.monthly.panel"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Monthly Summary
              </h2>
              <p className="text-xs text-muted-foreground">Last 4 months</p>
            </div>
            <Calendar size={18} className="text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {MONTHLY_SUMMARY.map((m, i) => (
              <div
                key={m.month}
                data-ocid={`earnings.month.item.${i + 1}`}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary hover:border-primary/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {m.month}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.trips} trips
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-base font-bold text-primary">
                    ₹{m.earnings.toLocaleString("en-IN")}
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      m.status === "current"
                        ? "bg-primary/20 text-primary border-primary/30 text-xs"
                        : "bg-success/20 text-success border-success/30 text-xs"
                    }
                  >
                    {m.status === "current" ? "In Progress" : "Paid"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Daily breakdown table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-glow rounded-2xl border border-border bg-card overflow-hidden"
        data-ocid="earnings.table"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-base font-bold text-foreground">
            Daily Breakdown — This Week
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Day</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground text-right">
                Trips
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                Distance
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                Earnings
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                Avg/Trip
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeklyData.map((d, i) => (
              <TableRow
                key={d.day}
                data-ocid={`earnings.row.${i + 1}`}
                className="border-border hover:bg-secondary/50"
              >
                <TableCell className="font-semibold text-foreground">
                  {d.day}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.date}
                </TableCell>
                <TableCell className="text-right text-foreground">
                  {d.trips}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {d.distance} km
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  ₹{d.earnings.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  ₹{Math.round(d.earnings / d.trips)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex justify-between">
          <span className="text-sm text-muted-foreground">Weekly Total</span>
          <span className="text-sm font-bold text-primary">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
