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
            Diferencia ordeñado − despachado (L), por día.
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
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} width={40} />
              <Tooltip labelFormatter={(value) => shortDate(String(value))} />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Line
                type="monotone"
                dataKey="difference"
                name="Diferencia (L)"
                stroke="#dc2626"
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
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={40} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="milked"
                name="Ordeñado (L)"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="dispatched"
                name="Despachado (L)"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
