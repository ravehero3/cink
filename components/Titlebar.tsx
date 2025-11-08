export default function Titlebar({ title }: { title: string }) {
  return (
    <div className="bg-white py-2xl">
      <div className="max-w-container mx-auto px-lg">
        <h1 className="text-page-title font-bold text-center uppercase tracking-tighter">{title}</h1>
      </div>
    </div>
  );
}
