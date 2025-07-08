import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, AlertCircle, X } from "lucide-react";
import QRCode from "react-qr-code";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 存款加密货币选项
const depositCryptos = [
  { code: "ETH", name: "ETH", icon: "/ethereum-eth-logo.svg", selected: false },
  { code: "BTC", name: "BTC", icon: "/bitcoin-btc-logo.svg", selected: false },
  { code: "USDT", name: "USDT", icon: "/tether-usdt-logo.svg", selected: true },
];

const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("crypto");
  const [selectedCrypto, setSelectedCrypto] = useState("USDT");

  const depositAddress = "TPKyA6Gt7PFMt8Q8Yw5NDSBhtdA2QawEsZ";

  // 复制地址到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 可以添加提示复制成功的逻辑
      console.log(t("topHeader.addressCopied"));
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-700 text-white p-0 max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            {t("topHeader.depositModalTitle")}
          </DialogTitle>
        </DialogHeader>

        {/* 标签页切换 */}
        <Tabs
          defaultValue="crypto"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 bg-neutral-800/50 mx-6 mb-0 rounded-lg p-1">
            <TabsTrigger
              value="crypto"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all"
            >
              {t("topHeader.cryptoTab")}
            </TabsTrigger>
            <TabsTrigger
              value="fiat"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all"
            >
              {t("topHeader.fiatTab")}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(90vh-200px)]" type="always">
            <TabsContent value="crypto" className="p-6 space-y-6 mt-0">
              {/* 加密货币选择 */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-neutral-400">
                  {t("topHeader.selectCrypto", "Select Cryptocurrency")}
                </h3>
                <div className="flex gap-3">
                  {depositCryptos.map((crypto) => (
                    <button
                      key={crypto.code}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        selectedCrypto === crypto.code
                          ? "bg-primary/20 border-2 border-primary text-white"
                          : "bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600 text-neutral-300"
                      }`}
                      onClick={() => setSelectedCrypto(crypto.code)}
                    >
                      <img
                        src={crypto.icon}
                        alt={crypto.code}
                        className="w-6 h-6"
                      />
                      <span className="font-medium">{crypto.code}</span>
                    </button>
                  ))}
                  <button className="flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600 transition-all text-neutral-400">
                    <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center">
                      <span className="text-lg">+</span>
                    </div>
                    <span>{t("topHeader.more")}</span>
                  </button>
                </div>
              </div>

              {/* 表单区域 */}
              <div className="space-y-4 bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                {/* 存款货币选择 */}
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">
                    {t("topHeader.depositCurrencyLabel")}
                  </label>
                  <Select defaultValue="USDT">
                    <SelectTrigger className="w-full bg-neutral-900 border-neutral-600 text-white hover:border-neutral-500 transition-colors h-12">
                      <div className="flex items-center gap-2">
                        <img
                          src="/tether-usdt-logo.svg"
                          alt="USDT"
                          className="w-6 h-6"
                        />
                        <SelectValue placeholder="USDT" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 网络选择 */}
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">
                    {t("topHeader.chooseNetworkLabel")}
                  </label>
                  <Select defaultValue="tron">
                    <SelectTrigger className="w-full bg-neutral-900 border-neutral-600 text-white hover:border-neutral-500 transition-colors h-12">
                      <SelectValue placeholder="Tron (TRC20)" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                      <SelectItem value="tron">Tron (TRC20)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 奖金选择 */}
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">
                    {t("topHeader.chooseBonusLabel")}
                  </label>
                  <Select defaultValue="no_bonus">
                    <SelectTrigger className="w-full bg-neutral-900 border-neutral-600 text-white hover:border-neutral-500 transition-colors h-12">
                      <SelectValue
                        placeholder={t("topHeader.depositWithoutBonus")}
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                      <SelectItem value="no_bonus">
                        {t("topHeader.depositWithoutBonus")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 奖金信息 */}
                <div className="flex items-start gap-3 bg-primary/10 p-4 rounded-lg border border-primary/30">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-200">
                      {t("topHeader.bonusInfo")}
                    </p>
                    <a
                      href="#"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      {t("topHeader.bonusTerms")}
                    </a>
                  </div>
                  <button className="text-neutral-400 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 存款地址 */}
              <div className="space-y-4 bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                <label className="text-sm font-medium text-neutral-300 block">
                  {t("topHeader.depositAddressLabel")}
                </label>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-36 h-36 bg-white p-3 rounded-lg flex items-center justify-center shadow-lg">
                      <QRCode
                        value={depositAddress}
                        size={120}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        level="H"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-neutral-400 mb-2">
                        {t("topHeader.depositNetwork", "Network")}: Tron (TRC20)
                      </p>
                      <p className="text-sm font-mono text-neutral-200 break-all bg-neutral-900 rounded-lg p-3 border border-neutral-700">
                        {depositAddress}
                      </p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(depositAddress)}
                      className="w-full bg-primary hover:bg-primary/90 text-white mt-3"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {t("topHeader.copyAddress")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 底部警告 */}
              <div className="flex items-start gap-3 bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-500 mb-1">
                    {t("topHeader.important", "Important")}
                  </p>
                  <p className="text-sm text-neutral-300">
                    {t("topHeader.depositWarning", {
                      currency: selectedCrypto,
                      minAmount: 1,
                    })}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fiat" className="p-6">
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-neutral-600" />
                </div>
                <p className="text-neutral-400 text-lg">
                  {t("topHeader.fiatNotAvailable")}
                </p>
                <p className="text-neutral-500 text-sm mt-2">
                  {t("topHeader.fiatComingSoon", "Fiat deposits coming soon")}
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;