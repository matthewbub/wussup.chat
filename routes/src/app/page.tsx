import { BudgetDashboard } from "../components/BudgetDashboard";
import { Transaction, Bill, Income, GroceryItem } from "../../types/budget";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const fastFood: Transaction[] = [
  {
    date: "'11/27/2024'",
    description: "'Panda Express'",
    amount: 5,
    category: "'Fast Food'",
    year: 2024,
    month: 11,
  },
  {
    date: "'11/27/2024'",
    description: "'Juice It Up Redl'",
    amount: 6.99,
    category: "'Fast Food'",
    year: 2024,
    month: 11,
  },
  {
    date: "'11/27/2024'",
    description: "'Starbucks'",
    amount: 9.25,
    category: "'Fast Food'",
    year: 2024,
    month: 11,
  },
  {
    date: `${currentMonth}/15/${currentYear}`,
    description: "'Burger King'",
    amount: 8.5,
    category: "'Fast Food'",
    year: currentYear,
    month: currentMonth,
  },
];

const businessExpenses: Transaction[] = [
  {
    date: "'11/24/2024'",
    description: "'Coderabbit* Coderabbit'",
    amount: 15,
    category: "'Business'",
    year: 2024,
    month: 11,
  },
  {
    date: "'11/22/2024'",
    description: "'Disney Plus'",
    amount: 16.99,
    category: "'Business'",
    year: 2024,
    month: 11,
  },
  {
    date: "'11/21/2024'",
    description: "'Google You Tube Premium'",
    amount: 13.99,
    category: "'Business'",
    year: 2024,
    month: 11,
  },
  {
    date: `${currentMonth}/10/${currentYear}`,
    description: "'Adobe Creative Cloud'",
    amount: 52.99,
    category: "'Business'",
    year: currentYear,
    month: currentMonth,
  },
];

const generalExpenses: Transaction[] = [
  {
    date: "'11/22/2024'",
    description: "'Target'",
    amount: 15.09,
    category: "'General'",
    year: 2024,
    month: 11,
  },
  {
    date: "'11/21/2024'",
    description: "'Target'",
    amount: 20.95,
    category: "'General'",
    year: 2024,
    month: 11,
  },
  {
    date: "'11/20/2024'",
    description: "'Sp Qomfortco'",
    amount: 35.99,
    category: "'General'",
    year: 2024,
    month: 11,
  },
  {
    date: `${currentMonth}/05/${currentYear}`,
    description: "'Amazon'",
    amount: 45.99,
    category: "'General'",
    year: currentYear,
    month: currentMonth,
  },
];

const groceries: GroceryItem[] = [
  {
    date: "'11/20/2024'",
    description: "'Apples'",
    amount: 4.99,
    estimatedNextAmount: 5.5,
    category: "'Grocery'",
    year: 2024,
    month: 11,
    store: "'Staterbros'",
  },
  {
    date: "'11/20/2024'",
    description: "'Bread'",
    amount: 3.49,
    estimatedNextAmount: 4.0,
    category: "'Grocery'",
    year: 2024,
    month: 11,
    store: "'Staterbros'",
  },
  {
    date: "'11/20/2024'",
    description: "'Milk'",
    amount: 3.99,
    estimatedNextAmount: 4.5,
    category: "'Grocery'",
    year: 2024,
    month: 11,
    store: "'Staterbros'",
  },
  {
    date: "'11/19/2024'",
    description: "'Eggs'",
    amount: 5.99,
    estimatedNextAmount: 6.5,
    category: "'Grocery'",
    year: 2024,
    month: 11,
    store: "'Walmart'",
  },
  {
    date: "'11/19/2024'",
    description: "'Chicken'",
    amount: 8.99,
    estimatedNextAmount: 10.0,
    category: "'Grocery'",
    year: 2024,
    month: 11,
    store: "'Walmart'",
  },
  {
    date: "'11/18/2024'",
    description: "'Pasta'",
    amount: 2.49,
    estimatedNextAmount: 3.0,
    category: "'Grocery'",
    year: 2024,
    month: 11,
    store: "'Staterbros'",
  },
  {
    date: "'11/18/2024'",
    description: "'Tomato Sauce'",
    amount: 1.99,
    estimatedNextAmount: 2.5,
    category: "'Grocery'",
    year: 2024,
    month: 11,
    store: "'Staterbros'",
  },
  {
    date: `${currentMonth}/01/${currentYear}`,
    description: "'Organic Vegetables'",
    amount: 12.99,
    estimatedNextAmount: 14.5,
    category: "'Grocery'",
    year: currentYear,
    month: currentMonth,
    store: "'Whole Foods'",
  },
];

const upcomingBills: Bill[] = [
  {
    dueDate: "'11/11/2024'",
    description: "'Spectrum WIFI'",
    amount: 68.24,
    year: 2024,
    month: 11,
  },
  {
    dueDate: "'12/24/2024'",
    description: "'Verizon'",
    amount: 321.01,
    year: 2024,
    month: 12,
  },
  {
    dueDate: "'12/27/2024'",
    description: "'SoCal Gas'",
    amount: 53.22,
    year: 2024,
    month: 12,
  },
  {
    dueDate: `${currentMonth}/15/${currentYear}`,
    description: "'Electricity Bill'",
    amount: 85.5,
    year: currentYear,
    month: currentMonth,
  },
];

const income: Income[] = [
  {
    date: "'11/28/2024'",
    description: "'Mpulse mobile in'",
    amount: 2150.36,
    category: "'Income'",
    year: 2024,
    month: 11,
  },
  {
    date: "'11/26/2024'",
    description: "'MyPay advance'",
    amount: 50,
    category: "'Income'",
    year: 2024,
    month: 11,
  },
  {
    date: "'11/23/2024'",
    description: "'MyPay advance'",
    amount: 50,
    category: "'Income'",
    year: 2024,
    month: 11,
  },
  {
    date: `${currentMonth}/01/${currentYear}`,
    description: "'Salary'",
    amount: 3000,
    category: "'Income'",
    year: currentYear,
    month: currentMonth,
  },
];

export default function Home() {
  return (
    <BudgetDashboard
      fastFood={fastFood}
      businessExpenses={businessExpenses}
      generalExpenses={generalExpenses}
      groceries={groceries}
      upcomingBills={upcomingBills}
      income={income}
    />
  );
}
