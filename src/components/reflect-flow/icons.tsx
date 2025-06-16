
import {
  Mic,
  Pause,
  Play,
  Edit3,
  Trash2,
  MousePointer2,
  Type as TypeIconLucide,
  Navigation,
  ArrowDownUp,
  Send,
  ShieldCheck,
  Save,
  Square,
  CheckSquare as LucideCheckSquare,
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
  ChevronRight,
  Watch,
  CheckCircle2,
  PlayCircle,
  X,
  PlusSquare,
  Eraser,
  AtSign,
  ToggleRight,
  WholeWord,
  ListChecks,
  Sigma,
  Maximize2,
  Tags,
  LocateFixed,
  FileCode,
  Move,
  Camera,
  Hand,
  ListOrdered,
  ALargeSmall,
  Replace,
  Sparkles,
  PanelRightClose,
  PanelLeftOpen,
  ChevronUp,
  ChevronDown,
  Keyboard,
  HelpCircle,
  ChevronsUpDown, // For combobox trigger, or isEqual
  PauseCircle, // For Pause step
  Bug, // For Debug step
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
export const AssertIcon = ShieldCheck;
export const SaveIcon = Save;
export const CheckboxSquareIcon = LucideCheckSquare;
export const CheckboxUncheckedIcon = Square;
export const AddIcon = PlusCircle;
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
export const AssertionIcon = ListChecks;
export const ActionIcon = PlayCircle;

export const XIcon = X;

// Specific icons for menu / step types
export const AddValueIcon = PlusSquare;
export const ClearValueIcon = Eraser;
export const GetAttributeIcon = AtSign;
export const IsEnabledIcon = ToggleRight;
export const IsExistingIcon = CheckCircle2;
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
export const SetValueIcon = Replace;
export const ExecuteScriptIcon = Sparkles;
export const DoubleClickIcon = MousePointer2; // Can be same as ClickIcon or a variant

export const KeyboardIcon = Keyboard;

// Panel collapse/expand icons
export const CollapsePanelIcon = PanelRightClose;
export const ExpandPanelIcon = PanelLeftOpen;
export const ChevronUpIcon = ChevronUp;
export const ChevronDownIcon = ChevronDown;

export const HelpCircleIcon = HelpCircle;

// New Icons from latest request
export const FileCodeIcon = FileCode; // For ExecuteScriptStep
export const ChevronsUpDownIcon = ChevronsUpDown; // For Combobox and potentially IsEqualStep
export const PauseCircleIcon = PauseCircle; // For PauseStep
export const BugIcon = Bug; // For DebugStep
export const ListChecksIcon = ListChecks; // For SelectOptionStep (re-using existing)
export const HandIcon = Hand; // For DragAndDropStep & TouchActionStep (re-using existing)
export const WatchIcon = Watch; // For WaitUntilStep (re-using existing AssertIcon for waitForElement)

