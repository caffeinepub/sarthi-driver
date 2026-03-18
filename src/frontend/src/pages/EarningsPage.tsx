import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, IndianRupee, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useGetEarnings } from "../hooks/useQueries";

export function EarningsPage() {
  const { data: earnings } = useGetEarnings();

  const weeklyValues = earnings?.weeklyEarnings ?? [0, 0, 0, 0, 0, 0, 0];
  const total = weeklyValues.reduce((s, d) => s + d, 0);
  const maxEarning = Math.max(...weeklyValues, 1);
  const todayEarnings = earnings?.todayEarnings ?? 0;
  const totalTrips = Number(earnings?.totalTrips ?? 0);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
              Aapki weekly aur monthly kamai
            </p>
          </div>
          <Button
            variant="outline"
            data-ocid="earnings.download.button"
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
            label: "Aaj",
            value: `₹${todayEarnings.toLocaleString("en-IN")}`,
            sub: `${totalTrips} trips`,
            color: "text-primary",
          },
          {
            label: "Is Hafte",
            value: `₹${total.toLocaleString("en-IN")}`,
            sub: `${totalTrips} trips`,
            color: "text-primary",
          },
          {
            label: "Is Mahine",
            value: `₹${todayEarnings.toLocaleString("en-IN")}`,
            sub: "--",
            color: "text-success",
          },
          {
            label: "Sab Milake",
            value: `₹${total.toLocaleString("en-IN")}`,
            sub: `${totalTrips} trips`,
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
                Is Hafte Ki Kamai
              </h2>
              <p className="text-xs text-muted-foreground">Daily breakdown</p>
            </div>
            <Badge
              className="bg-primary/20 text-primary border-primary/30"
              variant="outline"
            >
              <TrendingUp size={11} className="mr-1" /> Weekly
            </Badge>
          </div>

          {total === 0 ? (
            <div className="text-center py-8">
              <IndianRupee
                size={32}
                className="mx-auto mb-2 text-muted-foreground opacity-30"
              />
              <p className="text-sm text-muted-foreground">
                Abhi koi kamai nahi
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Trips complete karne ke baad yahan dikhega
              </p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-40 mb-4">
              {days.map((day, i) => {
                const val = weeklyValues[i] ?? 0;
                const pct = (val / maxEarning) * 100;
                const isToday = i === new Date().getDay() - 1;
                return (
                  <div
                    key={day}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {val > 0 ? `₹${(val / 100).toFixed(0)}k` : ""}
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
                        style={{ height: `${Math.max(pct, 4)}%` }}
                        title={`${day}: ₹${val}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

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
                ₹{total > 0 ? Math.round(total / 7).toLocaleString("en-IN") : 0}
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
              <p className="text-xs text-muted-foreground">Pichle mahine</p>
            </div>
            <Calendar size={18} className="text-muted-foreground" />
          </div>
          <div className="text-center py-8">
            <Calendar
              size={32}
              className="mx-auto mb-2 text-muted-foreground opacity-30"
            />
            <p className="text-sm text-muted-foreground">
              Abhi koi monthly data nahi
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Trips karne ke baad yahan dikhega
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
