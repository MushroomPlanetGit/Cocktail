import HomePage from "@/app/page";

export default function PreviewPage() {
  return (
    <div className="flex items-center justify-center h-full rounded-lg bg-card p-4">
        <div className="relative mx-auto border-foreground/20 bg-foreground/10 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
            <div className="w-[148px] h-[18px] bg-foreground/20 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
            <div className="h-[46px] w-[3px] bg-foreground/20 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-foreground/20 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-foreground/20 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background">
              <div className="w-full h-full overflow-auto">
                <HomePage />
              </div>
            </div>
        </div>
    </div>
  );
}
