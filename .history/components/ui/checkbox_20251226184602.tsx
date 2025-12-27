"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "type" | "onChange"> {
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      indeterminate,
      onCheckedChange,
      onBlur,
      checked,
      defaultChecked,
      disabled,
      name,
      value,
      required,
      id,
      autoFocus,
      form,
      tabIndex,
      onFocus,
      onKeyDown,
      onKeyUp,
      onClick,
      onMouseDown,
      onMouseUp,
      onMouseEnter,
      onMouseLeave,
      onPointerDown,
      onPointerUp,
      onPointerEnter,
      onPointerLeave,
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
      onWheel,
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      onTransitionEnd,
      onContextMenu,
      onDoubleClick,
      onDrag,
      onDragEnd,
      onDragEnter,
      onDragExit,
      onDragLeave,
      onDragOver,
      onDragStart,
      onDrop,
      onInput,
      onInvalid,
      onPaste,
      onCompositionStart,
      onCompositionEnd,
      onCompositionUpdate,
      onSelect,
      onSelectCapture,
      onChangeCapture,
      onBlurCapture,
      onFocusCapture,
      onKeyDownCapture,
      onKeyUpCapture,
      onClickCapture,
      onMouseDownCapture,
      onMouseUpCapture,
      onMouseEnterCapture,
      onMouseLeaveCapture,
      onPointerDownCapture,
      onPointerUpCapture,
      onPointerEnterCapture,
      onPointerLeaveCapture,
      onTouchStartCapture,
      onTouchEndCapture,
      onTouchCancelCapture,
      onWheelCapture,
      onAnimationStartCapture,
      onAnimationEndCapture,
      onAnimationIterationCapture,
      onTransitionEndCapture,
      onContextMenuCapture,
      onDoubleClickCapture,
      onDragCapture,
      onDragEndCapture,
      onDragEnterCapture,
      onDragExitCapture,
      onDragLeaveCapture,
      onDragOverCapture,
      onDragStartCapture,
      onDropCapture,
      onInputCapture,
      onInvalidCapture,
      onPasteCapture,
      onCompositionStartCapture,
      onCompositionEndCapture,
      onCompositionUpdateCapture,
      onSelectCapture: _onSelectCapture,
      ...rest
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (!innerRef.current) return;
      innerRef.current.indeterminate = Boolean(indeterminate);
    }, [indeterminate]);

    return (
      <input
        ref={innerRef}
        type="checkbox"
        id={id}
        name={name}
        value={value}
        form={form}
        tabIndex={tabIndex}
        autoFocus={autoFocus}
        required={required}
        disabled={disabled}
        checked={checked}
        defaultChecked={defaultChecked}
        aria-checked={indeterminate ? "mixed" : checked}
        className={cn(
          "h-4 w-4 rounded border border-input bg-background text-primary shadow-sm",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(e) => {
          onCheckedChange?.(e.target.checked);
          rest.onChange?.(e);
        }}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
        onWheel={onWheel}
        onAnimationStart={onAnimationStart}
        onAnimationEnd={onAnimationEnd}
        onAnimationIteration={onAnimationIteration}
        onTransitionEnd={onTransitionEnd}
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        onDragEnter={onDragEnter}
        onDragExit={onDragExit}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDragStart={onDragStart}
        onDrop={onDrop}
        onInput={onInput}
        onInvalid={onInvalid}
        onPaste={onPaste}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        onCompositionUpdate={onCompositionUpdate}
        onSelect={onSelect}
        onChangeCapture={onChangeCapture}
        onBlurCapture={onBlurCapture}
        onFocusCapture={onFocusCapture}
        onKeyDownCapture={onKeyDownCapture}
        onKeyUpCapture={onKeyUpCapture}
        onClickCapture={onClickCapture}
        onMouseDownCapture={onMouseDownCapture}
        onMouseUpCapture={onMouseUpCapture}
        onMouseEnterCapture={onMouseEnterCapture}
        onMouseLeaveCapture={onMouseLeaveCapture}
        onPointerDownCapture={onPointerDownCapture}
        onPointerUpCapture={onPointerUpCapture}
        onPointerEnterCapture={onPointerEnterCapture}
        onPointerLeaveCapture={onPointerLeaveCapture}
        onTouchStartCapture={onTouchStartCapture}
        onTouchEndCapture={onTouchEndCapture}
        onTouchCancelCapture={onTouchCancelCapture}
        onWheelCapture={onWheelCapture}
        onAnimationStartCapture={onAnimationStartCapture}
        onAnimationEndCapture={onAnimationEndCapture}
        onAnimationIterationCapture={onAnimationIterationCapture}
        onTransitionEndCapture={onTransitionEndCapture}
        onContextMenuCapture={onContextMenuCapture}
        onDoubleClickCapture={onDoubleClickCapture}
        onDragCapture={onDragCapture}
        onDragEndCapture={onDragEndCapture}
        onDragEnterCapture={onDragEnterCapture}
        onDragExitCapture={onDragExitCapture}
        onDragLeaveCapture={onDragLeaveCapture}
        onDragOverCapture={onDragOverCapture}
        onDragStartCapture={onDragStartCapture}
        onDropCapture={onDropCapture}
        onInputCapture={onInputCapture}
        onInvalidCapture={onInvalidCapture}
        onPasteCapture={onPasteCapture}
        onCompositionStartCapture={onCompositionStartCapture}
        onCompositionEndCapture={onCompositionEndCapture}
        onCompositionUpdateCapture={onCompositionUpdateCapture}
        {...rest}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
