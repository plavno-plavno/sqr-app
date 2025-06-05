import { Avatar, AvatarFallback } from "@/shared/ui/kit/avatar"
import { Button } from "@/shared/ui/kit/button"
import { Card, CardContent } from "@/shared/ui/kit/card"
import { Menu, ArrowRightLeft, TrendingUp, PieChart, Mic } from "lucide-react"

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-3 text-black">
        <div className="font-semibold">9:41</div>
        <div className="flex items-center gap-1">
          {/* Signal and battery icons placeholder */}
          <div className="w-4 h-2 bg-black rounded-sm opacity-60"></div>
          <div className="w-6 h-3 border border-black/30 rounded-sm">
            <div className="w-4 h-1.5 bg-black rounded-sm m-0.5"></div>
          </div>
        </div>
      </div>

      {/* Header with Avatar and Menu */}
      <div className="flex justify-between items-center px-3 py-2 mb-6">
        <Avatar size="md" className="bg-[#E2E2E2]">
          <AvatarFallback className="bg-[#E2E2E2] text-[#242424]">
            <Menu size={16} />
          </AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Menu size={16} color="#242424" />
        </Button>
      </div>

      {/* Balance Section */}
      <div className="px-5 mb-8">
        <Card className="bg-white border-none shadow-none p-0">
          <CardContent className="p-0">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#242424]/50">Your balance</p>
              <p className="text-[32px] font-semibold text-[#242424] leading-tight">$5060,45</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Central Chart Placeholder */}
      <div className="flex justify-center mb-16">
        <div className="w-[100px] h-[100px] rounded-full bg-[#D9D9D9] relative">
          <div className="absolute inset-0 w-full h-[73px] top-[27px] rounded-full bg-[#E1E1E1]"></div>
          <div className="absolute inset-0 w-full h-[59px] top-[41px] rounded-full bg-[#D2D0D0]"></div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="px-5 mb-6">
        <div className="flex gap-2">
          <Card className="bg-[#F9F9F9] border-none shadow-none rounded-[14px] flex-1">
            <CardContent className="p-2 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#E7E7E7] rounded-[10px] flex items-center justify-center">
                <ArrowRightLeft size={12} color="#787878" />
              </div>
              <span className="text-xs text-[#787878] font-medium leading-tight">
                Quick<br />Transfer
              </span>
            </CardContent>
          </Card>

          <Card className="bg-[#F9F9F9] border-none shadow-none rounded-[14px] flex-1">
            <CardContent className="p-2 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#E7E7E7] rounded-[10px] flex items-center justify-center">
                <TrendingUp size={12} color="#787878" />
              </div>
              <span className="text-xs text-[#787878] font-medium">Show my expenses</span>
            </CardContent>
          </Card>

          <Card className="bg-[#F9F9F9] border-none shadow-none rounded-[14px] flex-1">
            <CardContent className="p-2 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#E7E7E7] rounded-[10px] flex items-center justify-center">
                <PieChart size={12} color="#787878" />
              </div>
              <span className="text-xs text-[#787878] font-medium">Invest</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="px-5 mb-20">
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-[#242424]/50">Last transactions</h3>
            <Button variant="ghost" className="text-base font-semibold text-[#242424] p-0 h-auto">
              Show All
            </Button>
          </div>

          {/* Transaction Cards */}
          <div className="flex gap-3">
            <Card className="bg-[#F9F9F9] border-none shadow-none rounded-[14px] w-56">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#242424]/50">
                    <span>19.05.2025</span>
                    <div className="w-1.5 h-1.5 bg-[#D9D9D9] rounded-full"></div>
                    <span>12:30</span>
                  </div>
                  <p className="text-base font-semibold text-[#242424]">Anna</p>
                </div>
                <span className="text-2xl font-semibold text-[#242424]">-$2</span>
              </CardContent>
            </Card>

            <Card className="bg-[#F9F9F9] border-none shadow-none rounded-[14px] w-56">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#242424]/50">
                    <span>21.05.2025</span>
                    <div className="w-1.5 h-1.5 bg-[#D9D9D9] rounded-full"></div>
                    <span>10:30</span>
                  </div>
                  <p className="text-base font-semibold text-[#242424]">John</p>
                </div>
                <span className="text-2xl font-semibold text-[#242424]">-$2</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-5 py-6">
        <div className="flex items-center justify-between">
          {/* Left cross icon */}
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-[#787878] absolute"></div>
              <div className="w-0.5 h-4 bg-[#787878] absolute"></div>
            </div>
          </div>

          {/* Center text */}
          <span className="text-2xl font-medium text-[#787878]">Tap to type</span>

          {/* Right microphone icon */}
          <Mic size={14} color="#787878" />
        </div>

        {/* Home indicator */}
        <div className="flex justify-center mt-6">
          <div className="w-[134px] h-1 bg-[#23282C] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export const Component = HomePage;
