"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] relative",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 relative z-10",
        className
      )}
      {...props}
      asChild
    >
      <motion.button
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
        whileTap={{
          scale: 0.98,
          transition: { duration: 0.1 },
        }}
      >
        {children}
      </motion.button>
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

// Enhanced TabsList with animated indicator
function AnimatedTabsList({
  children,
  className,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  value?: string;
}) {
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [tabElements, setTabElements] = React.useState<HTMLElement[]>([]);

  React.useEffect(() => {
    const tabContainer = document.querySelector('[data-slot="tabs-list"]');
    if (tabContainer) {
      const tabs = Array.from(
        tabContainer.querySelectorAll('[data-slot="tabs-trigger"]')
      ) as HTMLElement[];
      setTabElements(tabs);

      // Find active tab index
      const activeTab = tabs.findIndex(
        (tab) => tab.getAttribute("data-state") === "active"
      );
      if (activeTab !== -1) {
        setActiveTabIndex(activeTab);
      }
    }
  }, [value]);

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Animated background indicator */}
      {tabElements.length > 0 && (
        <motion.div
          className="absolute bg-background rounded-md shadow-sm z-0"
          initial={false}
          animate={{
            x: tabElements[activeTabIndex]?.offsetLeft || 0,
            width: tabElements[activeTabIndex]?.offsetWidth || 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.8,
          }}
          style={{
            height: "calc(100% - 6px)",
            top: "3px",
          }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
}

// Enhanced Tabs with animation support
function AnimatedTabs({
  children,
  className,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [activeTab, setActiveTab] = React.useState(props.defaultValue || "");

  const handleValueChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      onValueChange={handleValueChange}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === AnimatedTabsList) {
          return React.cloneElement(child, { value: activeTab } as {
            value: string;
          });
        }
        return child;
      })}
    </TabsPrimitive.Root>
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AnimatedTabs,
  AnimatedTabsList,
};
