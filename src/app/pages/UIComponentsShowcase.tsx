import React from 'react';
import { toast } from "sonner";
import { cn } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { 
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig 
} from '../components/ui/chart';
import { 
  Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, ResponsiveContainer 
} from 'recharts';
import { 
  Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger 
} from '../components/ui/drawer';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose 
} from '../components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  CarouselDots
} from '../components/ui/carousel';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '../components/ui/accordion';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { Skeleton } from '../components/ui/skeleton';
import { Checkbox } from '../components/ui/checkbox';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { 
  InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator 
} from '../components/ui/input-otp';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { NumberInput } from '../components/ui/number-input';
import { Textarea } from '../components/ui/textarea';
import { 
  Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption 
} from '../components/ui/table';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '../components/ui/alert-dialog';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, 
  DropdownMenuTrigger, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
  DropdownMenuPortal, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuGroup
} from '../components/ui/dropdown-menu';
import { 
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis 
} from '../components/ui/breadcrumb';
import { Calendar } from '../components/ui/calendar';
import { 
  Collapsible, CollapsibleContent, CollapsibleTrigger 
} from '../components/ui/collapsible';
import { 
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut 
} from '../components/ui/command';
import { 
  ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, 
  ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, 
  ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger 
} from '../components/ui/context-menu';
import { 
  HoverCard, HoverCardContent, HoverCardTrigger 
} from '../components/ui/hover-card';
import { 
  Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarRadioGroup, 
  MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger 
} from '../components/ui/menubar';
import { 
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, 
  NavigationMenuTrigger, navigationMenuTriggerStyle 
} from '../components/ui/navigation-menu';
import { 
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious 
} from '../components/ui/pagination';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '../components/ui/popover';
import { 
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose 
} from '../components/ui/sheet';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '../components/ui/tooltip';
import { ScrollArea } from '../components/ui/scroll-area';
import { Toggle } from '../components/ui/toggle';
import { 
  AlertCircle, 
  Terminal, 
  User, 
  Settings, 
  Bell,
  Mail, 
  Plus, 
  Loader2,
  ChevronRight,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Info,
  CheckCircle2,
  TriangleAlert,
  Search,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';

export function UIComponentsShowcase() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <div className="container mx-auto py-10 px-4 space-y-16 max-w-6xl">
      <header className="space-y-4 border-b pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">UI Components Master Showcase</h1>
        <p className="text-muted-foreground text-xl">
          Everything from the <code className="bg-muted px-1 rounded">src/app/components/ui</code> folder.
        </p>
      </header>

      {/* Form Controls */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Form Controls</h2>
            <Badge variant="outline">Inputs & Toggles</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="example-switch">Notificaciones por Correo</Label>
              <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-primary/20">
                <Switch id="example-switch" />
                <span className="text-sm text-slate-600 font-medium">Recibir alertas de inventario bajo</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ajustes de Sistema</Label>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-800">Modo Oscuro Automático</span>
                  <p className="text-xs text-slate-500">Cambia el tema según la hora del día</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="flex items-center space-x-3 opacity-50 cursor-not-allowed">
              <Switch disabled />
              <Label className="text-sm font-medium">Opción Deshabilitada</Label>
            </div>
          </Card>

          <Card className="p-8 space-y-6">
             <div className="space-y-2">
                <Label>Entrada de Texto Premium</Label>
                <Input placeholder="Escribe algo aquí..." className="rounded-xl" />
             </div>
             <div className="space-y-2">
                <Label>Área de Texto</Label>
                <Textarea placeholder="Comentarios adicionales..." className="rounded-xl min-h-[120px]" />
             </div>
          </Card>
        </div>
      </section>

      {/* Buttons & Badges */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
           <h2 className="text-3xl font-bold tracking-tight">Buttons & Badges</h2>
           <Badge variant="outline">Interactive</Badge>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Base Variants</h4>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="premium">Premium Gradient</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sizes</h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Interactive & Icons</h4>
            <div className="flex flex-wrap gap-4 items-center">
              <Button disabled>Disabled</Button>
              <Button><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</Button>
              <Button size="icon" variant="outline"><Settings className="size-5" /></Button>
              <Button variant="premium"><Plus className="mr-2 size-4" /> New Project</Button>
              <Toggle aria-label="Toggle bold" className="border shadow-sm"><Bold className="h-4 w-4" /></Toggle>
              <ToggleGroup type="multiple" className="border p-1 rounded-lg bg-muted/30">
                <ToggleGroupItem value="bold" className="rounded-md"><Bold className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="italic" className="rounded-md"><Italic className="h-4 w-4" /></ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Badge>Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge size="sm">Small</Badge>
              <Badge size="default">Default</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Status Indicators</h3>
            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2">
                  <Badge variant="success" className="px-1.5"><div className="size-1.5 rounded-full bg-current mr-1.5" /> Active</Badge>
               </div>
               <div className="flex items-center gap-2">
                  <Badge variant="warning" className="px-1.5"><div className="size-1.5 rounded-full bg-current mr-1.5 animate-pulse" /> Pending</Badge>
               </div>
               <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="px-1.5"><div className="size-1.5 rounded-full bg-current mr-1.5" /> Inactive</Badge>
               </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Alerts */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Alerts & Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              You can add components to your app using the cli.
            </AlertDescription>
          </Alert>
          
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              A new software update is available. Please update now.
            </AlertDescription>
          </Alert>
          
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your profile has been updated successfully.
            </AlertDescription>
          </Alert>
          
          <Alert variant="warning">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Your subscription is about to expire. Please renew it soon.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again later.
            </AlertDescription>
          </Alert>

          <Alert variant="sweet" className="md:col-span-2 border shadow-lg">
            <div className="mb-4 p-3 bg-primary/10 rounded-full">
               <CheckCircle2 className="size-8 text-primary" />
            </div>
            <AlertTitle className="text-2xl font-bold">Sweet Success!</AlertTitle>
            <AlertDescription className="text-base max-w-full">
              Everything worked out perfectly. This variant is ideal for centered, modal-like success messages.
            </AlertDescription>
            <div className="mt-6 flex gap-3">
               <Button variant="outline">Dismiss</Button>
               <Button>Continue</Button>
            </div>
          </Alert>
        </div>
      </section>

      {/* Inputs & Forms */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Inputs & Form Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Label>Standard Input</Label>
            <Input placeholder="Type something..." />
            <Label>Number Input (New)</Label>
            <NumberInput placeholder="0.00" step={0.5} />
            <Label>Textarea</Label>
            <Textarea placeholder="Type a long message..." />
          </div>
          <div className="space-y-4">
            <Label>Select</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Option 1</SelectItem>
                <SelectItem value="2">Option 2</SelectItem>
                <SelectItem value="3">Option 3</SelectItem>
              </SelectContent>
            </Select>
            <Label>Checkbox & Switch</Label>
            <div className="flex items-center gap-6">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Selection States</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox id="terms" defaultChecked />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="terms" className="text-sm font-semibold cursor-pointer">Accept Terms</Label>
                        <p className="text-xs text-muted-foreground">You agree to our friendly service agreement.</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox id="marketing" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="marketing" className="text-sm font-semibold cursor-pointer">Marketing Emails</Label>
                        <p className="text-xs text-muted-foreground">Receive updates about new products.</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 opacity-50">
                      <Checkbox id="disabled" disabled />
                      <Label htmlFor="disabled" className="text-sm font-semibold italic">Disabled Option</Label>
                    </div>
                  </div>
                </div>

                {/* Card Checkbox Example */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Card Selection</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <label 
                      htmlFor="card-check" 
                      className="relative flex items-start gap-4 rounded-xl border p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <Checkbox id="card-check" className="mt-1" />
                      <div className="grid gap-1">
                        <span className="font-bold">Enterprise Plan</span>
                        <span className="text-sm text-muted-foreground">Advanced agricultural monitoring and AI insights.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="airplane" />
                <Label htmlFor="airplane">Switch me</Label>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Label>Input OTP</Label>
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
      </section>

      {/* Overlays & Feedback */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Overlays & Feedback</h2>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-5 w-5" />
                Create New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                   <ShoppingCart className="size-6 text-primary" />
                </div>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Enter the details of the new item to add it to your inventory. 
                  All fields marked with an asterisk are required.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" placeholder="e.g. Fertilizante NPK 15-15-15" className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="number" placeholder="0.00" className="h-11" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Initial Stock</Label>
                    <Input id="stock" type="number" placeholder="0" className="h-11" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                   <div className="space-y-0.5">
                      <Label>Active Status</Label>
                      <p className="text-xs text-muted-foreground">Make this product visible to customers immediately.</p>
                   </div>
                   <Switch defaultChecked />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit" size="lg" className="px-8">Save Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Alert Dialog */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Alert Dialog</h3>
            <div className="flex gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="mx-auto sm:mx-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                       <AlertCircle className="size-6 text-destructive" />
                    </div>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Delete Forever</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Archive Project</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive this project?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The project will be hidden from your dashboard but can be restored later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Archive</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Sheet */}
          <Sheet>
            <SheetTrigger asChild><Button variant="outline">Open Sheet</Button></SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Side Sheet</SheetTitle>
                <SheetDescription>Useful for filters or mobile menus.</SheetDescription>
              </SheetHeader>
              <div className="py-10">Sheet content goes here.</div>
            </SheetContent>
          </Sheet>
          
          {/* Drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Mobile Filters
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>Smart Filters</DrawerTitle>
                  <DrawerDescription>Adjust your view preferences for the dashboard.</DrawerDescription>
                </DrawerHeader>
                <div className="px-6 py-2 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Order Priority</Label>
                    <div className="flex gap-2">
                      <Badge variant="success" className="cursor-pointer">High</Badge>
                      <Badge variant="outline" className="cursor-pointer">Medium</Badge>
                      <Badge variant="outline" className="cursor-pointer">Low</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Display Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start">Grid View</Button>
                      <Button className="justify-start">List View</Button>
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <Button className="w-full" size="lg">Apply Filters</Button>
                  <DrawerClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Hover Card */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Hover Preview</h3>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link" className="p-0 h-auto font-bold text-primary">@agroferr_oficial</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <Avatar className="size-12 ring-2 ring-primary/20">
                    <AvatarImage src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=100&auto=format&fit=crop" />
                    <AvatarFallback>AF</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold">Agroferr D'Campo</h4>
                    <p className="text-sm text-muted-foreground">
                      Soluciones integrales para el sector agropecuario. Innovación y calidad en cada semilla.
                    </p>
                    <div className="flex items-center pt-2">
                      <Calendar className="mr-2 h-4 w-4 opacity-70" />{" "}
                      <span className="text-xs text-muted-foreground">
                        Joined December 2021
                      </span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* Popover */}
          <Popover>
            <PopoverTrigger asChild><Button variant="outline">Popover</Button></PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2"><h4 className="font-medium leading-none">Dimensions</h4><p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p></div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="outline">Tooltip</Button></TooltipTrigger>
              <TooltipContent><p>Add to library</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Dropdown Menu - Basic */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Standard Dropdown</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline">Options Menu</Button></DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem>Billing<DropdownMenuShortcut>⌘B</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem>Team<DropdownMenuShortcut>⌘T</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Dropdown Menu - Selection */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Checkbox & Radio Items</h3>
            <div className="flex gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">Checkboxes</Button></DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>Status Bar</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Activity Bar</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>Panel</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">Radio Group</Button></DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value="right">
                    <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Dropdown Menu - Premium */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">User Profile Menu</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <Avatar className="h-full w-full">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Invite Users</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Email</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="mr-2 h-4 w-4" />
                          <span>More...</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Data Management (Table) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Data Management</h2>
            <Badge variant="outline">Advanced Tables</Badge>
        </div>
        <Card className="overflow-hidden border-slate-200 shadow-xl rounded-2xl">
           <Table>
              <TableHeader>
                 <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {[
                    { id: 1, name: "Fertilizante NitroX", cat: "Químicos", stock: 450, price: "$24.99", status: "Disponible" },
                    { id: 2, name: "Semillas de Maíz Híbrido", cat: "Semillas", stock: 120, price: "$85.00", status: "Bajo Stock" },
                    { id: 3, name: "Sistema de Riego Pro", cat: "Equipos", stock: 15, price: "$1,200.00", status: "Disponible" },
                    { id: 4, name: "Pesticida EcoSafe", cat: "Químicos", stock: 0, price: "$32.50", status: "Agotado" },
                 ].map((item) => (
                    <TableRow key={item.id} className="group cursor-pointer">
                       <TableCell className="font-bold text-slate-800">{item.name}</TableCell>
                       <TableCell className="text-slate-500">{item.cat}</TableCell>
                       <TableCell className="text-center font-medium">{item.stock} uds</TableCell>
                       <TableCell className="text-right font-black text-primary">{item.price}</TableCell>
                       <TableCell className="text-center">
                          <Badge 
                            variant={item.status === "Disponible" ? "default" : item.status === "Agotado" ? "destructive" : "secondary"}
                            className="rounded-lg px-2 py-0.5 text-[10px] uppercase font-black"
                          >
                            {item.status}
                          </Badge>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </Card>
      </section>

      {/* Notifications (Sonner) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <Badge variant="secondary">Sonner Toasts</Badge>
        </div>
        <Card className="p-8">
           <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 rounded-xl font-bold"
                onClick={() => toast.success("¡Producto Guardado!", {
                   description: "El inventario de Agroferr se ha actualizado correctamente.",
                })}
              >
                Trigger Success
              </Button>
              <Button 
                variant="outline" 
                className="border-destructive/20 text-destructive hover:bg-destructive/5 rounded-xl font-bold"
                onClick={() => toast.error("Error de Conexión", {
                   description: "No se pudo sincronizar con el servidor de Agroferr.",
                })}
              >
                Trigger Error
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl font-bold"
                onClick={() => toast.info("Nueva Actualización", {
                   description: "Versión 1.0 Premium ya está disponible en tu sucursal.",
                })}
              >
                Trigger Info
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl font-bold shadow-lg"
                onClick={() => toast("Confirmar Pedido", {
                   description: "¿Deseas procesar esta venta ahora?",
                   action: {
                      label: "Procesar",
                      onClick: () => console.log("Procesando..."),
                   },
                })}
              >
                Toast with Action
              </Button>
           </div>
        </Card>
      </section>

      {/* Floating Hints (Tooltips) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Floating Hints</h2>
            <Badge variant="outline">Interactive Tooltips</Badge>
        </div>
        <Card className="p-8">
           <div className="flex items-center gap-6">
              <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-slate-200 hover:border-primary/20 hover:bg-primary/5">
                          <Settings className="size-5 text-slate-600" />
                       </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                       <p>Configuración del Sistema</p>
                    </TooltipContent>
                 </Tooltip>

                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-slate-200 hover:border-primary/20 hover:bg-primary/5">
                          <Bell className="size-5 text-slate-600" />
                       </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                       <p>Notificaciones de Inventario</p>
                    </TooltipContent>
                 </Tooltip>

                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-slate-200 hover:border-primary/20 hover:bg-primary/5">
                          <Mail className="size-5 text-slate-600" />
                       </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                       <p>Mensajes de Clientes</p>
                    </TooltipContent>
                 </Tooltip>
              </TooltipProvider>
           </div>
           <p className="text-xs text-slate-400 mt-4 italic">Pasa el ratón por los iconos para ver la magia.</p>
        </Card>
      </section>

      {/* Segmented Controls (Toggle Group) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Segmented Controls</h2>
            <Badge variant="outline">Toggle Groups</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="p-8 space-y-4">
              <Label>Alineación de Texto</Label>
              <ToggleGroup type="single" defaultValue="left">
                 <ToggleGroupItem value="left" aria-label="Align Left">
                    Izquierda
                 </ToggleGroupItem>
                 <ToggleGroupItem value="center" aria-label="Align Center">
                    Centro
                 </ToggleGroupItem>
                 <ToggleGroupItem value="right" aria-label="Align Right">
                    Derecha
                 </ToggleGroupItem>
              </ToggleGroup>
           </Card>

           <Card className="p-8 space-y-4">
              <Label>Modo de Visualización</Label>
              <ToggleGroup type="single" defaultValue="grid">
                 <ToggleGroupItem value="list" aria-label="List View">
                    Lista
                 </ToggleGroupItem>
                 <ToggleGroupItem value="grid" aria-label="Grid View">
                    Cuadrícula
                 </ToggleGroupItem>
              </ToggleGroup>
           </Card>
        </div>
      </section>

      {/* Categorized Navigation (Tabs) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Categorized Navigation</h2>
            <Badge variant="outline">Interactive Tabs</Badge>
        </div>
        <Card className="p-8">
           <Tabs defaultValue="detalles" className="w-full">
              <TabsList className="mb-6">
                 <TabsTrigger value="detalles">Detalles del Producto</TabsTrigger>
                 <TabsTrigger value="stock">Control de Stock</TabsTrigger>
                 <TabsTrigger value="historial">Historial de Ventas</TabsTrigger>
              </TabsList>
              <TabsContent value="detalles" className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <h4 className="text-sm font-bold text-slate-800">Descripción General</h4>
                       <p className="text-sm text-slate-500 leading-relaxed">
                          Fertilizante de alta eficiencia diseñado para cultivos de maíz y frijol. 
                          Optimizado para suelos con baja retención de nitrógeno.
                       </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                       <span className="text-xs font-black text-primary uppercase tracking-widest">Recomendación</span>
                       <p className="text-sm text-primary/80 mt-1">Aplicar durante las primeras 2 semanas de siembra para resultados óptimos.</p>
                    </div>
                 </div>
              </TabsContent>
              <TabsContent value="stock">
                 <div className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                       <span className="text-2xl font-bold text-slate-400">450</span>
                    </div>
                    <p className="text-sm text-slate-500">Unidades disponibles en sucursal central.</p>
                 </div>
              </TabsContent>
              <TabsContent value="historial">
                 <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                       <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <span className="text-sm font-medium">Venta #120{i}</span>
                          <span className="text-sm font-bold text-slate-800">$45.00</span>
                       </div>
                    ))}
                 </div>
              </TabsContent>
           </Tabs>
        </Card>
      </section>

      {/* Side Panels (Sheet) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Side Panels</h2>
            <Badge variant="outline">Sheet Overlays</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="p-8 flex flex-col items-center justify-center space-y-6 bg-muted/20 border-dashed border-2">
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-bold italic">Lateral Experience</h3>
                 <p className="text-sm text-muted-foreground">Perfect for deep dives into product data without losing context.</p>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="premium" size="lg">Open Product Sheet</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Semilla de Maíz Híbrido</SheetTitle>
                    <SheetDescription>
                      Detalles técnicos y especificaciones de rendimiento para la temporada 2024.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-6 py-4 space-y-6 flex-1 overflow-y-auto">
                     <div className="aspect-video rounded-xl bg-muted overflow-hidden">
                        <ImageWithFallback 
                           src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop" 
                           alt="Corn seeds"
                           className="w-full h-full object-cover"
                        />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                           <span className="text-sm text-muted-foreground">Rendimiento</span>
                           <Badge variant="success">Alta</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                           <span className="text-sm text-muted-foreground">Resistencia</span>
                           <Badge variant="info">Premium</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                           <span className="text-sm text-muted-foreground">Stock</span>
                           <span className="text-sm font-bold">450 sacos</span>
                        </div>
                     </div>
                  </div>
                  <SheetFooter>
                     <Button className="w-full">Descargar Ficha Técnica</Button>
                     <SheetClose asChild>
                        <Button variant="ghost" className="w-full">Cerrar</Button>
                     </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
           </Card>

           <div className="flex flex-col justify-center p-8 bg-primary/5 rounded-2xl border border-primary/10">
              <h3 className="text-xl font-bold mb-4">Glassmorphism en acción</h3>
              <p className="text-muted-foreground mb-6">
                Nuestros paneles laterales utilizan desenfoque de fondo dinámico para mantener la jerarquía visual. 
                Observa cómo el contenido inferior se difumina sutilmente al abrir el panel.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-background rounded-xl border shadow-sm">
                    <p className="text-xs font-bold text-primary mb-1">Blur Amount</p>
                    <p className="text-sm font-medium">8px (Standard)</p>
                 </div>
                 <div className="p-4 bg-background rounded-xl border shadow-sm">
                    <p className="text-xs font-bold text-primary mb-1">Opacity</p>
                    <p className="text-sm font-medium">80% Premium</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Feedback & States (Skeleton) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Feedback & States</h2>
            <Badge variant="outline">Skeleton Loading</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Profile Skeleton */}
           <Card className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                 <Skeleton className="h-12 w-12 rounded-full" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                 </div>
              </div>
              <div className="space-y-2">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-[90%]" />
              </div>
           </Card>

           {/* Card Skeleton */}
           <Card className="p-0 overflow-hidden">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-4 space-y-3">
                 <Skeleton className="h-5 w-2/3" />
                 <Skeleton className="h-4 w-full" />
                 <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                 </div>
              </div>
           </Card>

           {/* List Skeleton */}
           <Card className="p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex gap-3">
                       <Skeleton className="h-10 w-10 rounded-lg" />
                       <div className="space-y-1.5">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                       </div>
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                 </div>
              ))}
           </Card>
        </div>
      </section>

      {/* Navigation & Layout */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Navigation & Layout</h2>
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Standard Breadcrumb</h3>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink href="/components">Components</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>Showcase</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">With Icons & Custom Separator</h3>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="flex items-center gap-1">
                      <Settings className="size-3.5" />
                      Settings
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator><span className="text-muted-foreground opacity-50">/</span></BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/profile" className="flex items-center gap-1">
                      <User className="size-3.5" />
                      Profile
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator><span className="text-muted-foreground opacity-50">/</span></BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-1">
                      <Mail className="size-3.5" />
                      Notifications
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary/80">Main Navigation (Mega Menu)</h3>
            <NavigationMenu className="z-10">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Catalog</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-b from-primary/20 to-primary p-6 no-underline outline-none focus:shadow-md transition-all group"
                            href="/"
                          >
                            <Terminal className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                            <div className="mb-2 mt-4 text-lg font-bold text-white">
                              Agroferr D'Campo
                            </div>
                            <p className="text-sm leading-tight text-white/80">
                              Innovación y calidad para el sector agropecuario. Descubre nuestra nueva línea de semillas.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink href="#">
                          <div className="text-sm font-bold leading-none">Semillas Certificadas</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Variedad de alto rendimiento para todo tipo de suelos.
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink href="#">
                          <div className="text-sm font-bold leading-none">Fertilizantes Orgánicos</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Nutrición avanzada sin químicos dañinos.
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink href="#">
                          <div className="text-sm font-bold leading-none">Equipamiento Pro</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Herramientas de durabilidad garantizada.
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                       <li>
                        <NavigationMenuLink href="#">
                          <div className="text-sm font-bold leading-none">Riego Inteligente</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Optimiza el consumo de agua con sensores IoT.
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink href="#">
                          <div className="text-sm font-bold leading-none">Asesoría Técnica</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Diagnóstico y seguimiento por expertos agrónomos.
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="/about" className={navigationMenuTriggerStyle()}>
                    About Us
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary/80">Application Menubar</h3>
            <Menubar className="w-fit px-2 border-primary/10 shadow-lg">
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    New Window <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem disabled>New Private Window</MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Share</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>Email Link</MenubarItem>
                      <MenubarItem>Messages</MenubarItem>
                      <MenubarItem>Notes</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem>
                    Print... <MenubarShortcut>⌘P</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Find</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>Search the web</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Find...</MenubarItem>
                      <MenubarItem>Find Next</MenubarItem>
                      <MenubarItem>Find Previous</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem>Cut</MenubarItem>
                  <MenubarItem>Copy</MenubarItem>
                  <MenubarItem>Paste</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
                  <MenubarCheckboxItem checked>Always Show Full URLs</MenubarCheckboxItem>
                  <MenubarSeparator />
                  <MenubarItem inset>
                    Reload <MenubarShortcut>⌘R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem disabled inset>
                    Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem inset>Toggle Fullscreen</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem inset>Hide Sidebar</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Profiles</MenubarTrigger>
                <MenubarContent>
                  <MenubarRadioGroup value="benoit">
                    <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                    <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                    <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
                  </MenubarRadioGroup>
                  <MenubarSeparator />
                  <MenubarItem inset>Edit...</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem inset>Add Profile...</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>

          <div className="flex flex-col md:flex-row gap-10 items-start">
             <div className="space-y-4">
               <h3 className="text-xl font-semibold">Calendar Picker</h3>
               <Calendar 
                mode="single" 
                selected={date} 
                onSelect={setDate} 
                className="rounded-xl border shadow-lg bg-card" 
                captionLayout="dropdown-buttons"
                fromYear={1950}
                toYear={2050}
               />
             </div>
             <div className="space-y-4 flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">Accordion</h3>
                    <Badge variant="outline">Interactive</Badge>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full border rounded-xl overflow-hidden bg-card shadow-sm">
                    <AccordionItem value="item-1" className="px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings className="size-4 text-primary" />
                          </div>
                          <span>General Settings</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        Manage your account settings and preferences here. This section can contain forms, switches, or any other UI elements.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2" className="px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-accent/10 rounded-lg">
                            <Mail className="size-4 text-accent" />
                          </div>
                          <span>Notification Preferences</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        Choose how you want to be notified about updates and activity.
                        <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                          <span className="text-sm">Email Notifications</span>
                          <Switch />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3" className="px-4 border-b-0">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-destructive/10 rounded-lg">
                            <AlertCircle className="size-4 text-destructive" />
                          </div>
                          <span>Privacy & Security</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        Configure your security settings and privacy options.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                           <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">Collapsible Section</h3>
                  <Badge variant="outline">Animated</Badge>
                </div>
                
                <Collapsible className="w-full max-w-[400px] space-y-2 border rounded-xl p-4 bg-card shadow-sm group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-primary/10 rounded-lg">
                          <Bell className="size-4 text-primary" />
                       </div>
                       <h4 className="text-sm font-bold">New Notifications</h4>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0 hover:bg-primary/10 group-data-[state=open]:rotate-180 transition-transform duration-300">
                        <ChevronRight className="h-4 w-4 text-primary" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <div className="rounded-md border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                    You have 3 unread messages in your inbox.
                  </div>
                  
                  <CollapsibleContent className="space-y-2">
                    <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-sm flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                      @agroferr mentioned you in a comment
                    </div>
                    <div className="rounded-lg border px-4 py-3 text-sm flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-muted-foreground/30" />
                      Monthly report is ready for download
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
        </div>
          </div>
        </div>
      </section>

      {/* Advanced Forms */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Advanced Forms</h2>
            <Badge variant="outline">Validation & Layout</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Form Example Card */}
           <Card className="p-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <h3 className="text-xl font-bold">Store Configuration</h3>
                    <p className="text-sm text-muted-foreground">Manage your store's public information and settings.</p>
                 </div>
                 <Separator />
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="font-semibold text-[14px]">Store Name</Label>
                       <Input placeholder="Agroferr D'Campo Central" className="h-11" />
                       <p className="text-[13px] text-muted-foreground/80">This is your public display name.</p>
                    </div>

                    <div className="space-y-2">
                       <Label className="font-semibold text-[14px] text-destructive">Store Email (Invalid)</Label>
                       <Input value="agroferr.email" className="h-11 border-destructive focus-visible:ring-destructive/20" />
                       <p className="text-destructive text-[13px] font-medium animate-in fade-in-0 slide-in-from-top-1 duration-200">
                          Please enter a valid email address.
                       </p>
                    </div>

                    <div className="flex items-start justify-between p-4 rounded-xl border bg-muted/30">
                       <div className="space-y-1">
                          <Label className="font-semibold text-[14px]">Maintenance Mode</Label>
                          <p className="text-[13px] text-muted-foreground/80 max-w-[200px]">
                             Disable public access to the store temporarily.
                          </p>
                       </div>
                       <Switch />
                    </div>
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline">Discard</Button>
                    <Button>Save Changes</Button>
                 </div>
              </div>
           </Card>

           {/* Form Info Card */}
           <div className="space-y-4 flex flex-col justify-center">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                 <Terminal className="size-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Arquitectura de Formularios</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nuestros formularios están construidos sobre <strong>React Hook Form</strong> y <strong>Radix UI</strong>, 
                garantizando accesibilidad completa (ARIA) y una gestión de estado eficiente.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    Validación en tiempo real con Zod
                 </li>
                 <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    Mensajes de error con animaciones suaves
                 </li>
                 <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    Layouts responsivos y accesibles
                 </li>
              </ul>
           </div>
        </div>
      </section>

      {/* Cards & Containers */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Cards & Containers</h2>
            <Badge variant="success">Premium</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Card */}
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-bold">+20.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                <Avatar size="xl">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>Jane Doe</CardTitle>
              <CardDescription>Senior Agricultural Consultant</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline">Consulting</Badge>
                <Badge variant="outline">Field Expert</Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">View Profile</Button>
            </CardFooter>
          </Card>

          {/* Product Card */}
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-muted/20">
            <div className="aspect-video bg-muted relative">
               <img 
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop" 
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                alt="Product"
               />
               <Badge className="absolute top-3 right-3 bg-primary/90">New Arrival</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Fertilizante Orgánico Plus</CardTitle>
              <CardDescription>Maximum growth and soil health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">$29.99</span>
                <span className="text-sm text-muted-foreground line-through">$39.99</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="premium" className="w-full gap-2">
                <ShoppingCart className="size-4" /> Add to Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Media & Carousels */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Media & Carousels</h2>
        <div className="max-w-4xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent>
              {[1, 2, 3, 4, 5].map((item) => (
                <CarouselItem key={item}>
                  <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">
                      <div className="p-8 flex flex-col justify-center space-y-4">
                        <Badge className="w-fit" variant="secondary">Special Offer</Badge>
                        <h3 className="text-4xl font-extrabold tracking-tight">Fertilizante Premium {item}</h3>
                        <p className="text-muted-foreground text-lg">
                          Maximiza el rendimiento de tus cultivos con nuestra nueva fórmula avanzada.
                        </p>
                        <Button className="w-fit" size="lg">Comprar Ahora</Button>
                      </div>
                      <div className="relative overflow-hidden bg-muted">
                        <img 
                          src={`https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop&v=${item}`} 
                          className="object-cover w-full h-full"
                          alt="Banner"
                        />
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            <CarouselDots />
          </Carousel>
        </div>
      </section>

      {/* Search & Navigation */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Search & Navigation</h2>
            <Badge>Smart Search</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Inline Command Palette */}
           <div className="space-y-4">
             <Label className="text-sm font-medium">Inline Search Interface</Label>
             <div className="rounded-xl border shadow-xl overflow-hidden bg-card">
               <Command className="rounded-none border-none">
                 <CommandInput placeholder="Type a command or search..." />
                 <CommandList>
                   <CommandEmpty>No results found.</CommandEmpty>
                   <CommandGroup heading="Quick Actions">
                     <CommandItem>
                       <Plus className="mr-2 h-4 w-4" />
                       <span>New Product</span>
                       <CommandShortcut>⌘N</CommandShortcut>
                     </CommandItem>
                     <CommandItem>
                       <Search className="mr-2 h-4 w-4" />
                       <span>Search Inventory</span>
                       <CommandShortcut>⌘F</CommandShortcut>
                     </CommandItem>
                   </CommandGroup>
                   <CommandSeparator />
                   <CommandGroup heading="Settings">
                     <CommandItem>
                       <User className="mr-2 h-4 w-4" />
                       <span>Profile</span>
                       <CommandShortcut>⌘P</CommandShortcut>
                     </CommandItem>
                     <CommandItem>
                       <Settings className="mr-2 h-4 w-4" />
                       <span>System Settings</span>
                       <CommandShortcut>⌘S</CommandShortcut>
                     </CommandItem>
                   </CommandGroup>
                 </CommandList>
               </Command>
             </div>
           </div>

           {/* Command Dialog Info */}
           <div className="space-y-4 flex flex-col justify-center bg-muted/30 p-8 rounded-2xl border border-dashed border-primary/20">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                 <Search className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Global Search Palette</h3>
              <p className="text-muted-foreground">
                Implement a global command palette that can be triggered from anywhere using <kbd className="px-2 py-1 bg-muted rounded border text-xs font-mono font-bold">⌘ K</kbd>.
              </p>
              <Button className="w-fit mt-4" variant="outline" onClick={() => alert('Command Dialog would open here!')}>
                Try Global Search
              </Button>
           </div>
        </div>
      </section>

      {/* Data Visualization & Charts */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Data Visualization</h2>
            <Badge variant="success">Interactive</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sales Trend - Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly revenue growth for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                sales: { label: "Sales", color: "var(--primary)" }
              }} className="h-[300px] w-full">
                <AreaChart data={[
                  { month: "Jan", sales: 4000 },
                  { month: "Feb", sales: 3000 },
                  { month: "Mar", sales: 5000 },
                  { month: "Apr", sales: 4500 },
                  { month: "May", sales: 6000 },
                  { month: "Jun", sales: 5500 },
                ]}>
                  <defs>
                    <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#fillSales)" 
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Inventory - Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Stock levels across main categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{
                stock: { label: "Stock Level", color: "var(--primary)" }
              }} className="h-[300px] w-full">
                <BarChart data={[
                  { category: "Fertilizantes", stock: 120 },
                  { category: "Semillas", stock: 80 },
                  { category: "Herramientas", stock: 45 },
                  { category: "Riego", stock: 90 },
                  { category: "Químicos", stock: 65 },
                ]}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tickMargin={10} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
                  <Bar 
                    dataKey="stock" 
                    fill="var(--primary)" 
                    radius={[6, 6, 0, 0]} 
                    className="opacity-90 hover:opacity-100 transition-opacity" 
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Display */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Data Display</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle>Standard Table</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">INV001</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="space-y-4">
             <Label>Pagination</Label>
             <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationEllipsis /></PaginationItem>
                <PaginationItem><PaginationNext href="#" /></PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Avatar Sizes & Shapes</h3>
                <div className="flex flex-wrap items-end gap-4">
                  <Avatar size="xs"><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>XS</AvatarFallback></Avatar>
                  <Avatar size="sm"><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>SM</AvatarFallback></Avatar>
                  <Avatar size="default"><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>DF</AvatarFallback></Avatar>
                  <Avatar size="lg" shape="rounded"><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>LG</AvatarFallback></Avatar>
                  <Avatar size="xl" shape="square"><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>XL</AvatarFallback></Avatar>
                  <Avatar size="2xl"><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>2X</AvatarFallback></Avatar>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Avatar Group</h3>
                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                  <Avatar className="ring-2 ring-background ring-offset-2">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar className="ring-2 ring-background ring-offset-2">
                    <AvatarImage src="https://github.com/nutlope.png" />
                    <AvatarFallback>NL</AvatarFallback>
                  </Avatar>
                  <Avatar className="ring-2 ring-background ring-offset-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background ring-offset-2">
                    +3
                  </div>
                </div>
              </div>
            </div>
            <Label>Progress & Slider</Label>
            <Progress value={45} />
            <Slider defaultValue={[25, 75]} max={100} step={1} />
          </div>
        </div>
      </section>

      {/* Aspect Ratio */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Aspect Ratio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ratio 16:9 (Cinematic)</h3>
            <div className="overflow-hidden rounded-xl border bg-muted shadow-lg">
              <AspectRatio ratio={16 / 9}>
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop"
                  alt="Agriculture"
                  className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                />
              </AspectRatio>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ratio 1:1 (Square)</h3>
            <div className="max-w-[300px] overflow-hidden rounded-xl border bg-muted shadow-lg">
              <AspectRatio ratio={1 / 1}>
                <img
                  src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2670&auto=format&fit=crop"
                  alt="Seedlings"
                  className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                />
              </AspectRatio>
            </div>
          </div>
        </div>
      </section>

      {/* Carousel & Command */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Advanced Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label>Carousel</Label>
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {[1, 2, 3].map((_, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card><CardContent className="flex aspect-square items-center justify-center p-6"><span className="text-4xl font-semibold">{index + 1}</span></CardContent></Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <div className="space-y-4">
            <Label>Command Palette (Inline)</Label>
            <Command className="rounded-lg border shadow-md">
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem><User className="mr-2 h-4 w-4" /><span>Profile</span></CommandItem>
                  <CommandItem><Settings className="mr-2 h-4 w-4" /><span>Settings</span></CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      </section>

      {/* Scroll & Viewports */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Scroll & Viewports</h2>
            <Badge variant="outline">Custom Scrollbars</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* ScrollArea Example */}
           <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                 <CardTitle className="text-lg">Recent Notifications</CardTitle>
                 <CardDescription>Scroll down to see more updates</CardDescription>
              </CardHeader>
              <ScrollArea className="h-[300px] w-full p-4">
                 <div className="space-y-4">
                    {Array.from({ length: 15 }).map((_, i) => (
                       <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                          <div className={cn(
                             "size-2 mt-1.5 rounded-full shrink-0",
                             i % 3 === 0 ? "bg-primary" : "bg-muted-foreground/30"
                          )} />
                          <div className="space-y-1">
                             <p className="text-sm font-bold">Actualización de Inventario #{1000 + i}</p>
                             <p className="text-xs text-muted-foreground">Se han recibido 50 unidades de Fertilizante Orgánico Plus en el almacén central.</p>
                             <p className="text-[10px] text-muted-foreground/50 uppercase font-bold">{i + 1}h ago</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </ScrollArea>
           </Card>

           {/* Info Card */}
           <div className="flex flex-col justify-center p-8 bg-primary/5 rounded-2xl border border-primary/10">
              <h3 className="text-xl font-bold mb-4">Experiencia de Navegación</h3>
              <p className="text-muted-foreground mb-6">
                Nuestras barras de desplazamiento personalizadas son discretas y elegantes, 
                utilizando los colores de tu marca para guiar al usuario sin sobrecargar la interfaz.
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-primary/40" />
                    <span className="text-xs font-medium">Standard State</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-primary/60" />
                    <span className="text-xs font-medium">Hover State</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <Separator />

      <footer className="text-center text-muted-foreground pb-20">
        <p>This page uses all components from the UI folder to ensure they are correctly styled in both Light and Dark modes.</p>
      </footer>
      {/* Verification & Security */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Verification & Security</h2>
            <Badge variant="outline">OTP Controls</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* OTP Example */}
           <Card className="p-8 flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-bold">Two-Factor Authentication</h3>
                 <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your device.</p>
              </div>
              
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <div className="text-center">
                 <Button variant="link" className="text-xs text-primary">Didn't receive a code? Resend</Button>
              </div>
           </Card>

           {/* Security Info */}
           <div className="flex flex-col justify-center p-8 bg-muted/30 rounded-2xl border border-dashed border-primary/20">
              <h3 className="text-xl font-bold mb-4">Interfaz de Verificación</h3>
              <p className="text-muted-foreground mb-6">
                Nuestros controles de OTP están diseñados para maximizar la legibilidad y minimizar errores durante el proceso de autenticación.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-primary">Smart Focus</p>
                    <p className="text-xs text-muted-foreground">Salto automático entre celdas.</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-primary">Brand Colors</p>
                    <p className="text-xs text-muted-foreground">Feedback visual institucional.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Media & Assets */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Media & Assets</h2>
            <Badge variant="outline">Robust Loading</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Success Case */}
           <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Successful Load</Label>
              <div className="rounded-2xl border shadow-xl overflow-hidden aspect-video">
                 <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop" 
                    alt="Agro Landscape"
                    className="w-full h-full"
                 />
              </div>
              <p className="text-xs text-muted-foreground text-center italic">Fade-in transition enabled</p>
           </div>

           {/* Error Case */}
           <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Broken Link Fallback</Label>
              <div className="rounded-2xl border shadow-xl overflow-hidden aspect-video">
                 <ImageWithFallback 
                    src="https://invalid-url.com/image.jpg" 
                    alt="Invalid Image"
                    className="w-full h-full"
                 />
              </div>
              <p className="text-xs text-muted-foreground text-center italic">Automatic brand-styled fallback</p>
           </div>

           {/* Info Card */}
           <div className="flex flex-col justify-center p-8 bg-primary/5 rounded-2xl border border-primary/10">
              <h3 className="text-xl font-bold mb-2">Visual Resilience</h3>
              <p className="text-sm text-muted-foreground">
                Garantiza que tu catálogo de productos nunca se vea vacío o con iconos de error del navegador. 
                Nuestras imágenes incluyen <strong> skeletons</strong> y <strong> fallbacks</strong> elegantes.
              </p>
           </div>
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Contextual Menus</h2>
            <Badge variant="outline">Right-Click</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Context Menu Area */}
           <ContextMenu>
             <ContextMenuTrigger className="flex h-[300px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-context-menu group">
               <div className="text-center space-y-2">
                  <div className="mx-auto size-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Settings className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-primary">Right-click here to see the premium menu</p>
               </div>
             </ContextMenuTrigger>
             <ContextMenuContent className="w-64">
               <ContextMenuItem inset>
                 Back
                 <ContextMenuShortcut>⌘[</ContextMenuShortcut>
               </ContextMenuItem>
               <ContextMenuItem inset disabled>
                 Forward
                 <ContextMenuShortcut>⌘]</ContextMenuShortcut>
               </ContextMenuItem>
               <ContextMenuItem inset>
                 Reload
                 <ContextMenuShortcut>⌘R</ContextMenuShortcut>
               </ContextMenuItem>
               <ContextMenuSub>
                 <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
                 <ContextMenuSubContent className="w-48">
                   <ContextMenuItem>
                     Save Page As...
                     <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
                   </ContextMenuItem>
                   <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                   <ContextMenuItem>Name Window...</ContextMenuItem>
                   <ContextMenuSeparator />
                   <ContextMenuItem>Developer Tools</ContextMenuItem>
                 </ContextMenuSubContent>
               </ContextMenuSub>
               <ContextMenuSeparator />
               <ContextMenuCheckboxItem checked>
                 Show Bookmarks Bar
                 <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
               </ContextMenuCheckboxItem>
               <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
               <ContextMenuSeparator />
               <ContextMenuRadioGroup value="pedro">
                 <ContextMenuLabel inset>People</ContextMenuLabel>
                 <ContextMenuSeparator />
                 <ContextMenuRadioItem value="pedro">
                   Pedro Duarte
                 </ContextMenuRadioItem>
                 <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
               </ContextMenuRadioGroup>
             </ContextMenuContent>
           </ContextMenu>

           {/* Context Menu Info Card */}
           <Card className="flex flex-col justify-center p-8 bg-gradient-to-br from-card to-primary/5">
              <h3 className="text-xl font-bold mb-4">Aumenta la Productividad</h3>
              <p className="text-muted-foreground mb-6">
                Los menús contextuales permiten a tus usuarios expertos realizar acciones complejas sin despegar la vista del elemento. 
                Perfecto para gestionar inventarios o editar tablas de datos rápidamente.
              </p>
              <div className="flex flex-wrap gap-2">
                 <Badge variant="secondary">Glassmorphism</Badge>
                 <Badge variant="secondary">Submenus</Badge>
                 <Badge variant="secondary">Shortcuts</Badge>
              </div>
           </Card>
        </div>
      </section>
    </div>
  );
}
