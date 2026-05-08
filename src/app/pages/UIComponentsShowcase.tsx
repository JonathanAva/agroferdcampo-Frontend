import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '../components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '../components/ui/accordion';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { Skeleton } from '../components/ui/skeleton';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { NumberInput } from '../components/ui/number-input';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '../components/ui/alert-dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, 
  DropdownMenuTrigger, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
  DropdownMenuPortal, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from '../components/ui/dropdown-menu';
import { 
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis 
} from '../components/ui/breadcrumb';
import { Calendar } from '../components/ui/calendar';
import { 
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious 
} from '../components/ui/carousel';
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
import { 
  ToggleGroup, ToggleGroupItem 
} from '../components/ui/toggle-group';
import { Toggle } from '../components/ui/toggle';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../components/ui/input-otp';
import { 
  AlertCircle, 
  Terminal, 
  User, 
  Settings, 
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
  TriangleAlert
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

      {/* Buttons & Badges */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
           <h2 className="text-3xl font-bold tracking-tight">Buttons & Badges</h2>
           <Badge variant="outline">Interactive</Badge>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large (Angular Style)</Button>
          <Button size="xl">Extra Large (Premium)</Button>
          <Button size="icon"><Settings className="h-4 w-4" /></Button>
          <Button><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading</Button>
          <Toggle aria-label="Toggle bold"><Bold className="h-4 w-4" /></Toggle>
          <ToggleGroup type="multiple">
            <ToggleGroupItem value="bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
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
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Check me</Label>
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
          {/* Dialog */}
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Open Dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>This is a standard dialog component.</DialogDescription>
              </DialogHeader>
              <div className="py-4">Dialog Content Area</div>
              <DialogFooter><Button>Action</Button></DialogFooter>
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

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">Dropdown</Button></DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem>Billing<DropdownMenuShortcut>⌘B</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Message</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Navigation & Layout */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Navigation & Layout</h2>
        <div className="space-y-8">
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

          <Menubar className="w-fit">
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New Tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
                <MenubarItem>New Window</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Share</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Undo</MenubarItem>
                <MenubarItem>Redo</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <div className="flex gap-10 items-start">
             <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border shadow" />
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
                <Label>Collapsible</Label>
                <Collapsible className="w-[350px] space-y-2">
                  <div className="flex items-center justify-between space-x-4 px-4">
                    <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
                    <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="w-9 p-0"><ChevronRight className="h-4 w-4" /></Button></CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-2">
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/primitives</div>
                  </CollapsibleContent>
                </Collapsible>
             </div>
          </div>
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

      <Separator />

      <footer className="text-center text-muted-foreground pb-20">
        <p>This page uses all components from the UI folder to ensure they are correctly styled in both Light and Dark modes.</p>
      </footer>
    </div>
  );
}
