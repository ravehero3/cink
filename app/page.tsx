import { prisma } from '@/lib/prisma';
import HomePageContent from "@/components/HomePageContent";

export default async function Home() {
  let initialSections: any[] = [];

  try {
    const sections = await prisma.heroSection.findMany({
      orderBy: { order: 'asc' },
    });
    initialSections = sections.map((section) => ({
      id: section.id,
      sectionKey: section.sectionKey,
      sectionType: section.sectionType,
      order: section.order,
      videoUrl: section.videoUrl || '',
      mobileVideoUrl: section.mobileVideoUrl || '',
      imageUrl: section.imageUrl || '',
      mobileImageUrl: section.mobileImageUrl || '',
      headerText: section.headerText || '',
      button1Text: section.button1Text || '',
      button2Text: section.button2Text || '',
      button1Link: section.button1Link || '',
      button2Link: section.button2Link || '',
      textColor: (section.textColor as 'black' | 'white') || 'black',
    }));
  } catch {
    // DB may not be available in dev; HomePageContent will fetch client-side as fallback
  }

  return <HomePageContent initialSections={initialSections} />;
}
