import { SocialMediaLinks } from "@/components/socialMediaLinks";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-[72px] p-12">
      <Image src={"/logo.svg"} width={200} height={100} alt="logo" />
      <iframe
        width="640"
        height="315"
        src="https://www.youtube.com/embed/j65859QXT24?si=rSazjuEnOIda6LS2?autoplay=1"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <div className="relative z-10 max-w-[860px]">
        <p className="text-gray-800 dark:text-white text-center">
          2018'den bu yana ara verdiğimiz SAMP platformunda, GTA V'deki oyuncu
          arkadaşlarımızın teşvikleriyle yeniden aktifiz. Vinewood yöneticileri
          olarak, sizlere yalnızca bir oyuncu kitlesi değil, gerçek bir topluluk
          sunuyoruz. Açık sözlülük, samimiyet ve anlayışla Vinewood'u birlikte
          geliştirip yenilikler ekleyerek daha ileriye taşıyacağız.
        </p>
      </div>
      <SocialMediaLinks />
    </main>
  );
}
