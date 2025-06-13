
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
} from 'lucide-react';

export const RecordIcon = CircleDot;
export const PauseIcon = Pause;
export const PlayIcon = Play;
export const EditIcon = Edit3;
export const DeleteIcon = Trash2;
export const ClickIcon = MousePointer2;
export const TypeActionIcon = TypeIconLucide;
export const NavigateIcon = Navigation;
export const ScrollIcon = ArrowDownUp;
export const SubmitIcon = Send;
// AssertIcon is general, ShieldCheck might be better for some specific assertions
export const AssertIcon = ShieldCheck;
export const SaveIcon = Save;
export const CheckboxSquareIcon = LucideCheckSquare; // Using aliased import
export const CheckboxUncheckedIcon = Square;
export const AddIcon = PlusCircle;
export const DragHandleIcon = GripVertical;
export const SettingsIcon = Settings2;
export const ViewIcon = Eye; // Used for "Is Visible"
export const MoreOptionsIcon = MoreVertical;
export const FileIcon = FileText; // General file/text related
export const CopyIcon = Copy;
export const PasteIcon = ClipboardCheck;
export const WarningIcon = AlertTriangle;
export const TargetIcon = Target;
export const SubMenuArrowIcon = ChevronRight;
export const WaitIcon = Watch; // General for wait menu
export const AssertionIcon = ListChecks; // General for assertion menu (was CheckCircle2)
export const ActionIcon = PlayCircle; // General for action menu
export const XIcon = X; // For close buttons

// New specific icons
export const AddValueIcon = PlusSquare;
export const ClearValueIcon = Eraser;
export const GetAttributeIcon = AtSign;
export const IsEnabledIcon = ToggleRight; // Also for waitForEnabled
export const IsExistingIcon = CheckCircle2; // Specific for existence checks (was AssertionIcon)
export const GetTextIcon = WholeWord;
export const GetPropertyIcon = Sigma;
export const GetSizeIcon = Maximize2;
export const GetTagNameIcon = Tags;
export const GetLocationIcon = LocateFixed;
export const GetHtmlIcon = FileCode;
export const MoveToIcon = Move;
export const SaveScreenshotIcon = Camera;
export const TouchActionIcon = Hand;
export const SelectByIndexIcon = ListOrdered;
export const SelectByTextIcon = ALargeSmall;
export const SetValueIcon = Replace; // Or TypeActionIcon depending on context
export const ExecuteScriptIcon = Sparkles;
export const DoubleClickIcon = MousePointer2; // Could use a variant if available or custom SVG
export const DragAndDropIcon = Move; // Re-using, or custom SVG needed for distinct visual

// Panel collapse/expand icons - Old
export const CollapsePanelIcon = PanelRightClose; // Kept for now if referenced elsewhere, but will be replaced in HeaderControls
export const ExpandPanelIcon = PanelLeftOpen;   // Kept for now if referenced elsewhere, but will be replaced in HeaderControls

// New Caret/Chevron icons for collapse/expand
export const ChevronUpIcon = ChevronUp;
export const ChevronDownIcon = ChevronDown;
