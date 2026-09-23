export default function DashboardLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-3 w-40 bg-muted rounded mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-muted rounded" />
          <div className="h-9 w-28 bg-muted rounded" />
        </div>
      </div>
      <div className="h-12 bg-muted rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-40 bg-muted rounded-lg" />
        <div className="h-40 bg-muted rounded-lg" />
      </div>
      <div className="h-10 bg-muted rounded-lg" />
      <div className="h-48 bg-muted rounded-lg" />
      <div className="h-10 bg-muted rounded-lg" />
      <div className="h-40 bg-muted rounded-lg" />
      <div className="h-10 bg-muted rounded-lg" />
    </div>
  );
}
