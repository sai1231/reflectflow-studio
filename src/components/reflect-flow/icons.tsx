
import {
  Mic,
  Pause,
  Play,
  Edit3,
  Trash2,
  MousePointer2,
  Type as TypeIcon, // Renamed to avoid conflict with TS Type
  Navigation,
  ArrowDownUp,
  Send,
  ShieldCheck,
  Save,
  Square,
  CheckSquare,
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
  Target // Added Target icon
} from 'lucide-react';

export const RecordIcon = CircleDot; // Changed from Mic / RadioTower for simplicity
export const PauseIcon = Pause;
export const PlayIcon = Play;
export const EditIcon = Edit3;
export const DeleteIcon = Trash2;
export const ClickIcon = MousePointer2;
export const TypeActionIcon = TypeIcon;
export const NavigateIcon = Navigation;
export const ScrollIcon = ArrowDownUp;
export const SubmitIcon = Send;
export const AssertIcon = ShieldCheck; // Kept for StepItem, but removed from HeaderControls
export const SaveIcon = Save;
export const CheckboxSquareIcon = CheckSquare;
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
export const TargetIcon = Target; // Exported TargetIcon

