export default function Loading() {
  return (
    <div className="container-page py-14">
      <div className="skeleton h-8 w-52" />
      <div className="mt-4 skeleton h-4 w-80" />
      <div className="mt-10 space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="surface p-6">
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-40" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-[92%]" />
              <div className="skeleton h-4 w-[76%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
