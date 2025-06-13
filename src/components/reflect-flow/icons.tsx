
import {
  Mic,
  Pause,
  Play,
  Edit3,
  Trash2,
  MousePointer2,
  Type as TypeIconLucide, // Renamed to avoid conflict with TS Type
  Navigation,
  ArrowDownUp,
  Send,
  ShieldCheck,
  Save,
  Square,
  CheckSquare as LucideCheckSquare, // Aliased to avoid conflict
  PlusCircle,
  GripVertical,
  Settings2,
  Eye,
  MoreVertical,
  FileText,
  Copy,
  ClipboardCheck,
  AlertTriangle,
  CircleDot,
  Target,
  ChevronRight, // For sub-menus
  Watch, // For Wait actions
  CheckCircle2, // For Assertions
  PlayCircle, // For Actions
  X, // For close buttons
  PlusSquare, // For addValue
  Eraser, // For clearValue
  AtSign, // For getAttribute
  ToggleRight, // For isEnabled/waitForEnabled
  WholeWord, // For getText
  ListChecks, // General for some assertions
  Sigma, // For computed values or properties
  Maximize2, // For getSize & Expand
  Tags, // For getTagName
  LocateFixed, // For getLocation
  FileCode, // For getHTML
  Move, // For moveTo
  Camera, // For saveScreenshot
  Hand, // For touchAction
  ListOrdered, // For selectByIndex
  ALargeSmall, // For selectByVisibleText / selectByAttribute (could be better)
  Replace, // For setValue if different from TypeActionIcon context
  Sparkles, // For execute/executeAsync
  PanelRightClose,
  PanelLeftOpen,
  ChevronUp,
  ChevronDown,
  Keyboard, // For KeyDown/KeyUp
} from 'lucide-react';

export const RecordIcon = CircleDot;
export const PauseIcon = Pause;
export const PlayIcon = Play;
export const EditIcon = Edit3; // Kept for potential future use, but StepItem is always editable now
export const DeleteIcon = Trash2;
export const ClickIcon = MousePointer2;
export const TypeActionIcon = TypeIconLucide;
export const NavigateIcon = Navigation;
export const ScrollIcon = ArrowDownUp;
export const SubmitIcon = Send; // Might not be used directly if mapping to click
export const AssertIcon = ShieldCheck; // General for waitForElement/assertions
export const SaveIcon = Save;
export const CheckboxSquareIcon = LucideCheckSquare;
export const CheckboxUncheckedIcon = Square;
export const AddIcon = PlusCircle; // Generic add
export const DragHandleIcon = GripVertical;
export const SettingsIcon = Settings2;
export const ViewIcon = Eye;
export const MoreOptionsIcon = MoreVertical;
export const FileIcon = FileText;
export const CopyIcon = Copy;
export const PasteIcon = ClipboardCheck;
export const WarningIcon = AlertTriangle;
export const TargetIcon = Target;
export const SubMenuArrowIcon = ChevronRight;
export const WaitIcon = Watch;
export const AssertionIcon = ListChecks; // Used in ElementHoverPopup
export const ActionIcon = PlayCircle; // Used in ElementHoverPopup & StepItem for generic "action" feel

export const XIcon = X;

// Specific icons for menu / step types
export const AddValueIcon = PlusSquare;
export const ClearValueIcon = Eraser;
export const GetAttributeIcon = AtSign;
export const IsEnabledIcon = ToggleRight;
export const IsExistingIcon = CheckCircle2;
export const GetTextIcon = WholeWord;
export const GetPropertyIcon = Sigma; // For generic property
export const GetSizeIcon = Maximize2;
export const GetTagNameIcon = Tags; // Not directly in new types, but useful icon
export const GetLocationIcon = LocateFixed;
export const GetHtmlIcon = FileCode; // Not directly in new types
export const MoveToIcon = Move;
export const SaveScreenshotIcon = Camera; // Not in new types
export const TouchActionIcon = Hand; // Not in new types
export const SelectByIndexIcon = ListOrdered; // Not in new types
export const SelectByTextIcon = ALargeSmall; // Not in new types
export const SetValueIcon = Replace; // Or TypeActionIcon
export const ExecuteScriptIcon = Sparkles; // Not in new types
export const DoubleClickIcon = MousePointer2; // Could make a variant if needed

export const KeyboardIcon = Keyboard; // For KeyDown/KeyUp steps

// Panel collapse/expand icons
export const CollapsePanelIcon = PanelRightClose;
export const ExpandPanelIcon = PanelLeftOpen;
export const ChevronUpIcon = ChevronUp;
export const ChevronDownIcon = ChevronDown;
