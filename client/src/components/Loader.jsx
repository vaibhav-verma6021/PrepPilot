export default function Loader({ text = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 py-20 px-5 text-dim text-[15px] font-medium">
      <div className="w-[38px] h-[38px] border-[3px] border-stroke border-t-brand rounded-full animate-spin" />
      <span>{text}</span>
    </div>
  )
}
