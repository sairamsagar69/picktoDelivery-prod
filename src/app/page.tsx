"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bike, 
  MapPin, 
  Phone, 
  User, 
  History, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Wallet, 
  Award, 
  Bell, 
  ArrowRight, 
  Navigation, 
  Smartphone, 
  FileText, 
  ShieldCheck, 
  Package, 
  MessageSquareQuote,
  AlertCircle,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clarifyDeliveryInstructions } from "@/ai/flows/clarify-delivery-instructions";

type AppState = 
  | "LOGIN" 
  | "ONBOARDING" 
  | "PENDING_APPROVAL" 
  | "DASHBOARD" 
  | "ACTIVE_ORDER" 
  | "EARNINGS" 
  | "PROFILE" 
  | "INCENTIVES"
  | "SUPPORT";

type OrderState = "PENDING" | "NAVIGATING_TO_PICKUP" | "ARRIVED_AT_PICKUP" | "PICKED_UP" | "NAVIGATING_TO_DROP" | "DELIVERED";

export default function PicktoApp() {
  const [appState, setAppState] = useState<AppState>("LOGIN");
  const [isOnline, setIsOnline] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [orderProgress, setOrderProgress] = useState<OrderState>("PENDING");
  const [otpValue, setOtpValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [timer, setTimer] = useState(10);
  const [aiClarification, setAiClarification] = useState<any>(null);
  
  // Onboarding data state
  const [onboardingData, setOnboardingData] = useState({
    fullName: "",
    city: "",
    vehicleType: "2 Wheeler",
    licenseNo: "",
    rcNo: "",
    insuranceNo: "",
    aadhaarNo: "",
    licenseFile: null as string | null,
    rcFile: null as string | null,
    insuranceFile: null as string | null,
    aadhaarFile: null as string | null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Simulate Order Assignment logic
  useEffect(() => {
    let interval: any;
    if (isOnline && !activeOrder && !incomingOrder) {
      interval = setInterval(() => {
        if (Math.random() > 0.8) {
          triggerIncomingOrder();
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isOnline, activeOrder, incomingOrder]);

  // Timer for incoming order
  useEffect(() => {
    let t: any;
    if (incomingOrder && timer > 0) {
      t = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (incomingOrder && timer === 0) {
      rejectOrder();
    }
    return () => clearInterval(t);
  }, [incomingOrder, timer]);

  const triggerIncomingOrder = () => {
    setIncomingOrder({
      id: "ORD-" + Math.floor(Math.random() * 9000 + 1000),
      customerName: "Alex Johnson",
      pickupAddress: "123 Gourmet St, Kitchen District",
      dropAddress: "456 Residence Ave, Highrise Tower B",
      earnings: 45.00,
      distance: 3.2,
      instructions: "Gate code is 1234. Please leave at the blue door. If it's raining, put it in the plastic box next to the bushes."
    });
    setTimer(10);
  };

  const acceptOrder = () => {
    setActiveOrder(incomingOrder);
    setIncomingOrder(null);
    setOrderProgress("NAVIGATING_TO_PICKUP");
    setAppState("ACTIVE_ORDER");
    toast({ title: "Order Accepted", description: "Navigate to pickup location." });
  };

  const rejectOrder = () => {
    setIncomingOrder(null);
    setTimer(10);
  };

  const handleClarifyInstructions = async () => {
    if (!activeOrder) return;
    try {
      const result = await clarifyDeliveryInstructions({ deliveryInstructions: activeOrder.instructions });
      setAiClarification(result);
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not clarify instructions." });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const stepKeys: Record<number, string> = {
      2: 'licenseFile',
      3: 'rcFile',
      4: 'insuranceFile',
      5: 'aadhaarFile'
    };

    const key = stepKeys[onboardingStep];
    if (key) {
      setOnboardingData(prev => ({ ...prev, [key]: fileName }));
      toast({ title: "File Uploaded", description: `${fileName} has been selected.` });
    }
    // Reset input value to allow re-uploading the same file
    if (e.target) e.target.value = '';
  };

  const renderLogin = () => (
    <div className="screen-content flex flex-col items-center justify-center space-y-8 h-full bg-white">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bike className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary">Pickto</h1>
        <p className="text-muted-foreground">Deliver More. Earn More.</p>
      </div>
      
      <div className="w-full space-y-4 px-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-muted-foreground">+91</span>
            <Input 
              id="phone" 
              placeholder="99999 99999" 
              className="pl-12 h-12 text-lg" 
              type="tel" 
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
            />
          </div>
        </div>
        
        {phoneValue.length === 10 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input 
              id="otp" 
              placeholder="----" 
              className="text-center h-12 text-2xl tracking-[1em]" 
              maxLength={4}
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
            />
          </div>
        )}

        <Button 
          type="button"
          className="action-button bg-primary hover:bg-primary/90 mt-6"
          disabled={phoneValue.length !== 10 || (phoneValue.length === 10 && otpValue.length !== 4)}
          onClick={() => setAppState("ONBOARDING")}
        >
          Login / Register
        </Button>
      </div>
    </div>
  );

  const renderOnboarding = () => {
    const steps = [
      { id: 1, title: "Basic Details", icon: <User className="w-5 h-5" /> },
      { id: 2, title: "Driving License", icon: <Smartphone className="w-5 h-5" />, field: 'licenseNo', fileField: 'licenseFile' },
      { id: 3, title: "RC & Vehicle", icon: <Bike className="w-5 h-5" />, field: 'rcNo', fileField: 'rcFile' },
      { id: 4, title: "Insurance", icon: <ShieldCheck className="w-5 h-5" />, field: 'insuranceNo', fileField: 'insuranceFile' },
      { id: 5, title: "Aadhaar Card", icon: <FileText className="w-5 h-5" />, field: 'aadhaarNo', fileField: 'aadhaarFile' }
    ];

    const currentStepConfig = steps[onboardingStep - 1];

    return (
      <div className="screen-content bg-white h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">Onboarding</h2>
          <span className="text-sm font-medium text-muted-foreground">Step {onboardingStep}/5</span>
        </div>
        
        <Progress value={(onboardingStep / 5) * 100} className="mb-8" />

        <div className="flex-1 space-y-6 overflow-y-auto">
          {onboardingStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  placeholder="Enter your full name" 
                  value={onboardingData.fullName}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input 
                  placeholder="Select City" 
                  value={onboardingData.city}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${onboardingData.vehicleType === '2 Wheeler' ? 'border-primary bg-primary/5' : 'opacity-50'}`}
                    onClick={() => setOnboardingData(prev => ({ ...prev, vehicleType: '2 Wheeler' }))}
                  >
                    <Bike className="w-8 h-8 text-primary" />
                    <span className="text-sm font-semibold">2 Wheeler</span>
                  </div>
                  <div 
                    className={`border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${onboardingData.vehicleType === 'Bicycle' ? 'border-primary bg-primary/5' : 'opacity-50'}`}
                    onClick={() => setOnboardingData(prev => ({ ...prev, vehicleType: 'Bicycle' }))}
                  >
                    <Bike className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-semibold">Bicycle</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {onboardingStep > 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-muted/30">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  {currentStepConfig.icon}
                </div>
                {onboardingData[currentStepConfig.fileField as keyof typeof onboardingData] ? (
                  <div className="text-center">
                    <p className="text-sm font-bold text-success flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {onboardingData[currentStepConfig.fileField as keyof typeof onboardingData]}
                    </p>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-primary" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Click to upload or take a photo of your <br/>
                    <strong>{currentStepConfig.title}</strong>
                  </p>
                )}
                {!onboardingData[currentStepConfig.fileField as keyof typeof onboardingData] && (
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    className="mt-4 gap-2" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>{currentStepConfig.title} Number</Label>
                <Input 
                  key={currentStepConfig.field}
                  placeholder={`Enter ${currentStepConfig.title} Number`} 
                  value={(onboardingData[currentStepConfig.field as keyof typeof onboardingData] as string) || ""}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, [currentStepConfig.field as string]: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-4 pt-4">
          <Button 
            type="button"
            className="action-button bg-primary"
            onClick={() => {
              if (onboardingStep < 5) setOnboardingStep(prev => prev + 1);
              else setAppState("PENDING_APPROVAL");
            }}
          >
            {onboardingStep === 5 ? "Submit Documents" : "Next Step"}
          </Button>
          {onboardingStep > 1 && (
            <Button type="button" variant="ghost" className="w-full" onClick={() => setOnboardingStep(prev => prev - 1)}>
              Back
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderPendingApproval = () => (
    <div className="screen-content flex flex-col items-center justify-center h-full text-center space-y-6 bg-white">
      <div className="w-24 h-24 bg-warning/20 rounded-full flex items-center justify-center animate-pulse">
        <Clock className="w-12 h-12 text-warning" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Verification Pending</h2>
        <p className="text-muted-foreground px-8">
          We are currently verifying your documents. This usually takes 24-48 hours. We'll notify you once you're approved.
        </p>
      </div>
      <Button 
        type="button"
        variant="outline" 
        className="w-full max-w-xs" 
        onClick={() => {
          setAppState("DASHBOARD");
        }}
      >
        Refresh Status
      </Button>
    </div>
  );

  const renderDashboard = () => (
    <div className="screen-content h-full bg-[#ECF1F6]">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Good Morning!</h1>
          <p className="text-muted-foreground text-sm">Sun, 24 Oct</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" className="bg-white rounded-full shadow-sm">
            <Bell className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            JD
          </div>
        </div>
      </header>

      <div className="space-y-4">
        <Card className={`transition-all duration-300 ${isOnline ? 'border-success bg-success/5 shadow-lg shadow-success/10' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{isOnline ? "You're Online" : "You're Offline"}</h3>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? "Waiting for nearby orders..." : "Go online to start receiving orders"}
                </p>
              </div>
              <div 
                className={`w-16 h-8 rounded-full relative cursor-pointer transition-colors duration-300 ${isOnline ? 'bg-success' : 'bg-muted'}`}
                onClick={() => setIsOnline(!isOnline)}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${isOnline ? 'left-9' : 'left-1'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Wallet className="w-6 h-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Today's Earnings</p>
              <h4 className="text-xl font-bold">₹ 840.00</h4>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <History className="w-6 h-6 text-accent mb-2" />
              <p className="text-xs text-muted-foreground">Completed</p>
              <h4 className="text-xl font-bold">12 Orders</h4>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-warning" />
              Daily Incentive
            </CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-warning border-warning">₹ 200 Reward</Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress: 12 / 15 orders</span>
              <span className="font-bold">80%</span>
            </div>
            <Progress value={80} className="h-2 bg-muted overflow-hidden" />
            <p className="text-[11px] text-muted-foreground text-center">Complete 3 more orders to unlock bonus</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="font-bold text-sm text-muted-foreground px-1 uppercase tracking-wider">High Demand Zones</h3>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <MapPin className="text-accent w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Tech Park Area</h4>
                  <p className="text-xs text-muted-foreground">Expected earnings 1.5x higher</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveOrder = () => {
    if (!activeOrder) return null;

    const progressSteps = {
      "NAVIGATING_TO_PICKUP": { label: "Go to Pickup", action: "Arrived at Pickup", next: "ARRIVED_AT_PICKUP" },
      "ARRIVED_AT_PICKUP": { label: "Pick up Order", action: "Confirm Picked Up", next: "PICKED_UP" },
      "PICKED_UP": { label: "Navigate to Customer", action: "Arrived at Drop", next: "NAVIGATING_TO_DROP" },
      "NAVIGATING_TO_DROP": { label: "Enter Delivery OTP", action: "Complete Delivery", next: "DELIVERED" }
    };

    const currentStep = progressSteps[orderProgress as keyof typeof progressSteps];

    return (
      <div className="screen-content h-full bg-[#ECF1F6] flex flex-col p-0 overflow-hidden">
        <div className="flex-1 relative bg-muted/20">
          <img 
            src="https://picsum.photos/seed/map/600/800" 
            alt="Map Navigation" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute top-4 left-4 right-4 animate-in slide-in-from-top-4">
            <Card className="bg-primary text-white shadow-xl">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Navigation className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Next Turn</p>
                  <h3 className="text-lg font-bold leading-tight">Turn Left onto Gourmet St</h3>
                  <p className="text-xs opacity-80">400 meters away</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-white rounded-t-3xl p-6 space-y-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8">
          <div className="w-12 h-1 bg-muted rounded-full mx-auto" />
          
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">{activeOrder.id}</Badge>
              <h2 className="text-2xl font-black">{currentStep?.label || "Complete"}</h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <Package className="w-4 h-4" />
                <span>Restaurant: Gourmet Kitchen</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-success">₹ {activeOrder.earnings}</p>
              <p className="text-xs text-muted-foreground">{activeOrder.distance} km total</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-xl border border-dashed">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4" />
                  Delivery Instructions
                </h4>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[10px] text-accent font-bold px-2 border border-accent/20 rounded-full"
                  onClick={handleClarifyInstructions}
                >
                  AI CLARIFY
                </Button>
              </div>
              <p className="text-sm italic">{activeOrder.instructions}</p>
              
              {aiClarification && (
                <div className="mt-4 pt-4 border-t border-dashed animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-accent/10 p-3 rounded-lg space-y-2">
                    <p className="text-xs font-bold text-accent uppercase">AI Summary</p>
                    <p className="text-xs leading-relaxed">{aiClarification.summary}</p>
                    <div className="space-y-1">
                      {aiClarification.actionItems.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-success mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {orderProgress === "NAVIGATING_TO_DROP" && (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Customer OTP</Label>
                <Input 
                  placeholder="Enter 4-digit OTP" 
                  className="h-12 text-center text-xl tracking-[0.5em] border-primary"
                  type="number"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline" 
                size="icon" 
                className="w-14 h-14 rounded-xl bg-muted/20"
                onClick={() => toast({ title: "Connecting...", description: "Calling Customer..." })}
              >
                <Phone className="w-6 h-6 text-primary" />
              </Button>
              <Button 
                type="button"
                className="flex-1 action-button bg-primary h-14"
                onClick={() => {
                  if (currentStep?.next) {
                    setOrderProgress(currentStep.next as any);
                    if (currentStep.next === "DELIVERED") {
                      toast({ title: "Delivery Complete", description: "Earnings added to wallet." });
                      setTimeout(() => {
                        setAppState("DASHBOARD");
                        setActiveOrder(null);
                        setAiClarification(null);
                      }, 1000);
                    }
                  }
                }}
              >
                {currentStep?.action}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEarnings = () => (
    <div className="screen-content h-full bg-[#ECF1F6] space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => setAppState("DASHBOARD")}>
          <ArrowRight className="w-6 h-6 rotate-180" />
        </Button>
        <h2 className="text-2xl font-bold">Earnings</h2>
      </div>

      <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-8 space-y-4">
          <p className="text-white/70 text-sm font-medium">Available for Withdrawal</p>
          <h3 className="text-4xl font-black">₹ 2,450.00</h3>
          <Button type="button" className="w-full bg-white text-primary hover:bg-white/90 font-bold py-6">Withdraw Now</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-white p-1 rounded-xl h-12 shadow-sm">
          <TabsTrigger value="daily" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Weekly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="space-y-4 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-transparent hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Package className="text-success w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Order #ORD-293{i}</h4>
                  <p className="text-xs text-muted-foreground">Oct 24 • 12:45 PM</p>
                </div>
              </div>
              <p className="font-black text-success">₹ 45.00</p>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="weekly">
           <div className="p-12 text-center space-y-4">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
               <History className="w-8 h-8" />
             </div>
             <p className="text-muted-foreground">Historical data loading...</p>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderProfile = () => (
    <div className="screen-content h-full bg-[#ECF1F6] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <Button type="button" variant="ghost" size="sm" className="text-destructive font-bold gap-2" onClick={() => setAppState("LOGIN")}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <Card className="bg-white border-none shadow-md">
        <CardContent className="p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-lg">
              JD
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-success rounded-full border-4 border-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold">John Doe</h3>
          <p className="text-sm text-muted-foreground">+91 99999 00000</p>
          <Badge className="mt-2 bg-success text-white">Verified Partner</Badge>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-muted-foreground uppercase px-1 tracking-widest">General Settings</h4>
        <div className="bg-white rounded-2xl divide-y shadow-sm">
          {[
            { icon: <Bike />, label: "Vehicle Information", value: "Honda Activa 5G" },
            { icon: <ShieldCheck />, label: "Security & KYC", value: "All verified" },
            { icon: <Settings />, label: "Preferences", value: "English, Notifications On" }
          ].map((item, idx) => (
            <div key={idx} className="p-4 flex items-center gap-4 hover:bg-muted/10 cursor-pointer">
              <div className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center text-primary">
                {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5" })}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.value}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
      
      <Button type="button" variant="outline" className="w-full text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10">Delete Account</Button>
    </div>
  );

  const renderSupport = () => (
    <div className="screen-content h-full bg-[#ECF1F6] space-y-6">
      <h2 className="text-2xl font-bold">Support</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white hover:border-primary cursor-pointer transition-all">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <Phone className="w-8 h-8 text-primary" />
            <h4 className="font-bold text-sm">Call Us</h4>
            <p className="text-[10px] text-muted-foreground">Available 24/7</p>
          </CardContent>
        </Card>
        <Card className="bg-white hover:border-accent cursor-pointer transition-all">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <MessageSquareQuote className="w-8 h-8 text-accent" />
            <h4 className="font-bold text-sm">Chat</h4>
            <p className="text-[10px] text-muted-foreground">Avg response: 2m</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-sm px-1">Common Issues</h4>
        <div className="space-y-2">
          {["Payment Delay", "App Crash", "Insurance Query", "KYC Issues"].map((q, i) => (
            <div key={i} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
              <span className="text-sm font-medium">{q}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl space-y-4 shadow-sm">
        <h4 className="font-bold">Report an Issue</h4>
        <div className="space-y-2">
          <Label className="text-xs">Describe what happened</Label>
          <textarea 
            className="w-full h-32 p-3 bg-muted/20 border rounded-xl text-sm focus:outline-primary"
            placeholder="Type your issue here..."
          />
        </div>
        <Button type="button" className="w-full action-button bg-primary">Submit Ticket</Button>
      </div>
    </div>
  );

  return (
    <div className="mobile-container">
      {/* Hidden file input used across onboarding steps */}
      <input 
        type="file" 
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        ref={fileInputRef} 
        onChange={handleFileUpload}
        accept="image/*,application/pdf"
      />

      {appState === "LOGIN" && renderLogin()}
      {appState === "ONBOARDING" && renderOnboarding()}
      {appState === "PENDING_APPROVAL" && renderPendingApproval()}
      {appState === "DASHBOARD" && renderDashboard()}
      {appState === "ACTIVE_ORDER" && renderActiveOrder()}
      {appState === "EARNINGS" && renderEarnings()}
      {appState === "PROFILE" && renderProfile()}
      {appState === "SUPPORT" && renderSupport()}

      {incomingOrder && (
        <div className="absolute inset-0 z-[100] bg-black/60 flex flex-col justify-end">
          <div className="bg-white w-full rounded-t-3xl p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Badge className="bg-accent text-white mb-2">New Delivery Offer</Badge>
                <h2 className="text-3xl font-black">₹ {incomingOrder.earnings}</h2>
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>{incomingOrder.distance} km total</span>
                </div>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="4"
                    fill="transparent"
                    r="28"
                    cx="32"
                    cy="32"
                  />
                  <circle
                    className="text-accent stroke-current transition-all duration-1000 ease-linear"
                    strokeWidth="4"
                    strokeDasharray={176}
                    strokeDashoffset={176 * (1 - timer / 10)}
                    strokeLinecap="round"
                    fill="transparent"
                    r="28"
                    cx="32"
                    cy="32"
                  />
                </svg>
                <span className="absolute text-xl font-black text-accent">{timer}s</span>
              </div>
            </div>

            <div className="space-y-4 py-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="w-0.5 h-10 bg-primary/20" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Pickup</p>
                    <p className="text-sm font-bold line-clamp-1">{incomingOrder.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Drop</p>
                    <p className="text-sm font-bold line-clamp-1">{incomingOrder.dropAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                type="button"
                variant="outline" 
                className="h-14 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5 font-bold"
                onClick={rejectOrder}
              >
                Reject
              </Button>
              <Button 
                type="button"
                className="h-14 rounded-2xl bg-[#4CAF50] hover:bg-[#45a049] text-white font-black text-lg"
                onClick={acceptOrder}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      {!["LOGIN", "ONBOARDING", "PENDING_APPROVAL", "ACTIVE_ORDER"].includes(appState) && (
        <nav className="bottom-nav">
          {[
            { id: "DASHBOARD", icon: <LayoutDashboard />, label: "Home" },
            { id: "EARNINGS", icon: <Wallet />, label: "Earnings" },
            { id: "SUPPORT", icon: <Phone />, label: "Support" },
            { id: "PROFILE", icon: <User />, label: "Profile" }
          ].map((item) => (
            <button 
              key={item.id}
              className={`flex flex-col items-center gap-1 transition-all ${appState === item.id ? 'text-primary scale-110' : 'text-muted-foreground'}`}
              onClick={() => setAppState(item.id as AppState)}
            >
              <div className={`p-2 rounded-xl ${appState === item.id ? 'bg-primary/10' : ''}`}>
                {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5" })}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
