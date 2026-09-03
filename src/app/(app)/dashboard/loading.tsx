export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-muted rounded" />
          <div className="h-9 w-28 bg-muted rounded" />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-6 w-24 bg-muted rounded" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-40 bg-muted rounded-lg" />
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
