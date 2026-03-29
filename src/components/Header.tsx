import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 bg-[#EFEEE9]/90 backdrop-blur-sm z-40 border-b border-[#040000]/8">
      <div className="max-w-[960px] mx-auto px-5 py-3 flex items-center gap-2">
        <Image src="/logo-symbol.svg" alt="" width={14} height={30} />
        <Image src="/logo-wordmark.svg" alt="droppi" width={50} height={13} />
      </div>
    </header>
  );
}
