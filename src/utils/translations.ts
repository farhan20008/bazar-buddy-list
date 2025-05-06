export const getText = (key: string, language: string): string => {
  const translations: { [key: string]: { [key: string]: string } } = {
    dashboardTitle: {
      en: "Dashboard",
      bn: "ড্যাশবোর্ড",
    },
    welcome: {
      en: "Welcome,",
      bn: "স্বাগতম,",
    },
    newList: {
      en: "New List",
      bn: "নতুন তালিকা",
    },
    totalLists: {
      en: "Total Lists",
      bn: "মোট তালিকা",
    },
    allTimeGroceryLists: {
      en: "All-Time Grocery Lists",
      bn: "সর্বকালের মুদি তালিকা",
    },
    totalItems: {
      en: "Total Items",
      bn: "মোট আইটেম",
    },
    itemsAcrossAllLists: {
      en: "Items Across All Lists",
      bn: "সমস্ত তালিকা জুড়ে আইটেম",
    },
    totalSpent: {
      en: "Total Spent",
      bn: "মোট খরচ",
    },
    estimatedTotalExpenses: {
      en: "Estimated Total Expenses",
      bn: "আনুমানিক মোট খরচ",
    },
    avgListCost: {
      en: "Avg. List Cost",
      bn: "গড় তালিকা খরচ",
    },
    averagePerGroceryList: {
      en: "Average Per Grocery List",
      bn: "মুদি তালিকা প্রতি গড়",
    },
    spendingHistory: {
      en: "Spending History",
      bn: "খরচের ইতিহাস",
    },
    expensesOverTime: {
      en: "Expenses Over Time",
      bn: "সময়ের সাথে খরচ",
    },
    recentLists: {
      en: "Recent Lists",
      bn: "সাম্প্রতিক তালিকা",
    },
    recentlyCreatedLists: {
      en: "Recently Created Lists",
      bn: "সম্প্রতি তৈরি করা তালিকা",
    },
    listName: {
      en: "List Name",
      bn: "তালিকার নাম",
    },
    items: {
      en: "Items",
      bn: "আইটেম",
    },
    estCost: {
      en: "Est. Cost",
      bn: "আনু. খরচ",
    },
    createNewList: {
      en: "Create New List",
      bn: "নতুন তালিকা তৈরি করুন",
    },
    addItems: {
      en: "Add items to your new list",
      bn: "আপনার নতুন তালিকায় আইটেম যোগ করুন",
    },
    listInformation: {
      en: "List Information",
      bn: "তালিকা তথ্য",
    },
    listDetails: {
      en: "Set the details for your new list",
      bn: "আপনার নতুন তালিকার বিবরণ সেট করুন",
    },
    listTitle: {
      en: "List Title",
      bn: "তালিকার শিরোনাম",
    },
    month: {
      en: "Month",
      bn: "মাস",
    },
    year: {
      en: "Year",
      bn: "বছর",
    },
    saving: {
      en: "Saving",
      bn: "সংরক্ষণ করা হচ্ছে",
    },
    saveList: {
      en: "Save List",
      bn: "তালিকা সংরক্ষণ করুন",
    },
    addItem: {
      en: "Add Item",
      bn: "আইটেম যোগ করুন",
    },
    addNewItem: {
      en: "Add a new item to your list",
      bn: "আপনার তালিকায় একটি নতুন আইটেম যোগ করুন",
    },
    itemsInList: {
      en: "Items in Your List",
      bn: "আপনার তালিকার আইটেম",
    },
    viewManageLists: {
      en: "View and manage your past lists",
      bn: "আপনার অতীতের তালিকা দেখুন এবং পরিচালনা করুন",
    },
    searchLists: {
      en: "Search lists...",
      bn: "তালিকা খুঁজুন...",
    },
    yourGroceryLists: {
      en: "Your Grocery Lists",
      bn: "আপনার মুদি তালিকা",
    },
    listsTotal: {
      en: "lists total",
      bn: "মোট তালিকা",
    },
    noListsMatch: {
      en: "No lists match your search.",
      bn: "আপনার অনুসন্ধানের সাথে মিলে যাওয়া কোনো তালিকা নেই।",
    },
    clearSearch: {
      en: "Clear Search",
      bn: "অনুসন্ধান পরিষ্কার করুন",
    },
    noListsYet: {
      en: "No lists yet! Start by creating one.",
      bn: "এখনো কোনো তালিকা নেই! একটি তৈরি করার মাধ্যমে শুরু করুন।",
    },
    createFirstList: {
      en: "Create First List",
      bn: "প্রথম তালিকা তৈরি করুন",
    },
    createdOn: {
      en: "Created On",
      bn: "তৈরি করা হয়েছে",
    },
  };

  return translations[key]?.[language] || translations[key]?.en || key;
};

// Add BDT currency symbol to translations
export const currencySymbols = {
  USD: "$",
  BDT: "৳"
};
