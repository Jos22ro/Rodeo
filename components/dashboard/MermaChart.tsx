"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  shiftLabel,
  type DailyMerma,
  type ShiftTotals,
} from "@/lib/dashboard/merma";

function round(liters: number): number {
  return Math.round(liters * 100) / 100;
}

function shortDate(value: string): string {
  const [, month, day] = value.split("-");
  return `${day}/${month}`;
}

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

const tickStyle = { fontSize: 12, fill: "var(--muted-foreground)" };

export function MermaChart({
  series,
  shifts,
}: {
  series: DailyMerma[];
  shifts: ShiftTotals[];
}) {
  const shiftData = shifts.map((shift) => ({
    label: shiftLabel(shift.shift),
    milked: round(shift.milked),
    dispatched: round(shift.dispatched),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diferencia últimos 30 días</CardTitle>
          <CardDescription>
            Ordeñado menos despachado, por día. Debajo de cero, se despachó más
            de lo ordeñado.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={series}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                minTickGap={24}
                tick={tickStyle}
              />
              <YAxis tick={tickStyle} width={40} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "var(--muted-foreground)" }}
                labelFormatter={(value) => shortDate(String(value))}
              />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Line
                type="monotone"
                dataKey="difference"
                name="Diferencia (L)"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por turno (hoy)</CardTitle>
          <CardDescription>Ordeñado contra despachado.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={shiftData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis dataKey="label" tick={tickStyle} />
              <YAxis tick={tickStyle} width={40} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "var(--muted-foreground)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="milked"
                name="Ordeñado (L)"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="dispatched"
                name="Despachado (L)"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
