import { v4 as uuidv4 } from "uuid";

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export const contactsMock: Contact[] = [
  {
    id: uuidv4(),
    name: "Anna Fox",
    phone: "(555) 555-1234",
  },
  {
    id: uuidv4(),
    name: "Alice Green",
    phone: "(555) 531-4567",
  },
  {
    id: uuidv4(),
    name: "Michael Smith",
    phone: "(555) 547-8810",
  },
  {
    id: uuidv4(),
    name: "Sophia Brown",
    phone: "(555) 678-2345",
  },
  {
    id: uuidv4(),
    name: "James White",
    phone: "(555) 789-3456",
  },
  {
    id: uuidv4(),
    name: "Emma Johnson",
    phone: "(555) 890-4567",
  },
  {
    id: uuidv4(),
    name: "Liam Davis",
    phone: "(555) 901-5678",
  },
  {
    id: uuidv4(),
    name: "John Doe",
    phone: "(555) 012-6789",
  },
];
