"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectLabel = SelectPrimitive.Label;
const SelectScrollDownButton = SelectPrimitive.ScrollDownButton;
const SelectScrollUpButton = SelectPrimitive.ScrollUpButton;
const SelectSeparator = SelectPrimitive.Separator;
const SelectValue = SelectPrimitive.Value;
const SelectViewport = SelectPrimitive.Viewport;

const Trigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 text-sm text-foreground shadow-inner outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <ChevronDown className="h-4 w-4 opacity-70" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
Trigger.displayName = SelectPrimitive.Trigger.displayName;

const Content = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    className={cn(
      "z-50 min-w-[10rem] overflow-hidden rounded-xl border border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/60",
      className,
    )}
    position={position}
    {...props}
  >
    <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-2">
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
    <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-2">
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  </SelectPrimitive.Content>
));
Content.displayName = SelectPrimitive.Content.displayName;

const Item = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex h-9 select-none items-center rounded-lg px-3 text-sm text-foreground outline-none data-[highlighted]:bg-foreground/10 data-[state=checked]:font-semibold data-[state=checked]:text-primary",
      className,
    )}
    {...props}
  >
    {children}
  </SelectPrimitive.Item>
));
Item.displayName = SelectPrimitive.Item.displayName;

export {
  Select,
  Trigger as SelectTrigger,
  Content as SelectContent,
  Item as SelectItem,
  SelectGroup,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectValue,
  SelectViewport,
};
