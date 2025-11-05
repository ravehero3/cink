export default function Titlebar({ title }: { title: string }) {
  return (
    <div className="h-titlebar bg-white flex items-center justify-center">
      <h1 className="text-title font-bold uppercase text-black">{title}</h1>
    </div>
  );
}
