import { 
  ShoppingCart, 
  FileText, 
  Calendar, 
  Truck, 
  BarChart3,
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const managementItems = [
  { id: 'bookings', title: 'Pesanan', icon: ShoppingCart },
  { id: 'manifest', title: 'Manifes', icon: FileText },
  { id: 'schedules', title: 'Jadwal', icon: Calendar },
  { id: 'operations', title: 'Operasional', icon: Truck },
];

const analyticsItems = [
  { id: 'analytics', title: 'Analisa Data', icon: BarChart3 },
];

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const isManagementActive = managementItems.some(item => item.id === activeTab);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="font-semibold text-foreground">Menu Admin</h2>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        {/* Manajemen Group */}
        <Collapsible defaultOpen={isManagementActive} className="group/collapsible">
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  {!isCollapsed && <span>Manajemen</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.id)}
                        isActive={activeTab === item.id}
                        tooltip={item.title}
                        className={cn(
                          "w-full justify-start",
                          activeTab === item.id && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Analisa Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {!isCollapsed && <span>Laporan</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    tooltip={item.title}
                    className={cn(
                      "w-full justify-start",
                      activeTab === item.id && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
