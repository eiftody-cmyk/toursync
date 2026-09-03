export default function ToursLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-24 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded mt-2" />
      </div>
      <div className="h-24 bg-muted rounded-lg" />
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
