// Waybill data types and interfaces for asset transfer documentation

export interface WaybillItem {
  id: string;
  assetName: string;
  tagNumber: string;
  serialNumber: string;
  category: string;
  condition: string;
  quantity: number;
  location: string;
}

export interface Waybill {
  id: string;
  waybillNumber: string;
  date: string;
  preparedBy: string;

  // Transfer details
  deliveredBy: string;
  authorisedBy: string;
  receivedBy: string;

  // Location details
  fromLocation: string;
  toLocation: string;

  // Items being transferred
  items: WaybillItem[];

  // Additional details
  purpose: string;
  notes?: string;
  status: "Draft" | "Approved" | "In Transit" | "Delivered" | "Cancelled";

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface WaybillFormData {
  deliveredBy: string;
  authorisedBy: string;
  receivedBy: string;
  fromLocation: string;
  toLocation: string;
  purpose: string;
  notes?: string;
  selectedAssets: string[]; // Asset IDs
}

// Dummy waybill data for demonstration
export const dummyWaybills: Waybill[] = [
  {
    id: "wb-001",
    waybillNumber: "WB-2024-001",
    date: "2024-08-25",
    preparedBy: "John Doe",
    deliveredBy: "Mike Johnson",
    authorisedBy: "Sarah Wilson",
    receivedBy: "David Brown",
    fromLocation: "Main Office - IT Department",
    toLocation: "Branch Office - Lagos",
    items: [
      {
        id: "item-1",
        assetName: "Dell OptiPlex 7090",
        tagNumber: "IT-001",
        serialNumber: "DL7090001",
        category: "Computer Equipment",
        condition: "Good",
        quantity: 1,
        location: "Main Office",
      },
      {
        id: "item-2",
        assetName: "HP LaserJet Pro",
        tagNumber: "PR-001",
        serialNumber: "HP2024001",
        category: "Office Equipment",
        condition: "Excellent",
        quantity: 1,
        location: "Main Office",
      },
    ],
    purpose: "Office Relocation",
    notes: "Handle with care - fragile equipment",
    status: "Approved",
    createdAt: "2024-08-25T10:00:00Z",
    updatedAt: "2024-08-25T10:30:00Z",
  },
  {
    id: "wb-002",
    waybillNumber: "WB-2024-002",
    date: "2024-08-24",
    preparedBy: "Jane Smith",
    deliveredBy: "Tom Wilson",
    authorisedBy: "Lisa Davis",
    receivedBy: "Mark Taylor",
    fromLocation: "Warehouse A",
    toLocation: "Branch Office - Abuja",
    items: [
      {
        id: "item-3",
        assetName: "Executive Desk",
        tagNumber: "FN-001",
        serialNumber: "ED2024001",
        category: "Office Furniture",
        condition: "Good",
        quantity: 2,
        location: "Warehouse A",
      },
    ],
    purpose: "New Branch Setup",
    status: "In Transit",
    createdAt: "2024-08-24T14:00:00Z",
    updatedAt: "2024-08-24T16:00:00Z",
  },
];

// Waybill statuses for filtering
export const waybillStatuses = [
  "All",
  "Draft",
  "Approved",
  "In Transit",
  "Delivered",
  "Cancelled",
];

// Common locations for dropdowns
export const commonLocations = [
  "Main Office - IT Department",
  "Main Office - HR Department",
  "Main Office - Finance Department",
  "Branch Office - Lagos",
  "Branch Office - Abuja",
  "Branch Office - Port Harcourt",
  "Warehouse A",
  "Warehouse B",
  "Storage Facility",
];

// Transfer purposes
export const transferPurposes = [
  "Office Relocation",
  "New Branch Setup",
  "Equipment Maintenance",
  "Asset Disposal",
  "Temporary Assignment",
  "Permanent Transfer",
  "Return to Store",
  "Other",
];

// Utility functions
export const generateWaybillNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `WB-${year}-${timestamp}`;
};

export const formatWaybillDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "Approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "In Transit":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};
