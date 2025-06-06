
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGrocery } from "@/contexts/GroceryContext";
import { formatCurrency } from "@/utils/currency";
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui/table";

const PrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const { getListById } = useGrocery();
  const { language } = useLanguage();
  const [list, setList] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const groceryList = getListById(id);
      if (groceryList) {
        setList(groceryList);
      }
    }
  }, [id, getListById]);

  if (!list) {
    return <div className="p-8 text-center">List not found</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <style>
        {`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              font-family: Arial, sans-serif;
            }
            
            @page {
              size: A4;
              margin: 1cm;
            }
            
            .print-table th, 
            .print-table td {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
              font-family: Arial, sans-serif;
            }
            
            .print-table th {
              background-color: #ff8c00 !important;
              color: white !important;
            }
            
            .print-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            .price-column {
              text-align: right !important;
            }

            /* Ensure Bangla text displays properly */
            * {
              font-family: 'Noto Sans Bengali', Arial, sans-serif !important;
            }
          }
        `}
      </style>
      
      {/* Add Noto Sans Bengali font for Bangla character support */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&display=swap" />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{list.title}</h1>
        <p className="text-gray-600">
          {list.month} {list.year} • Created on {new Date(list.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500 mt-2">Generated by BazarBuddy</p>
      </div>
      
      {/* Items Table with improved handling of Bangla characters */}
      <Table className="w-full print-table" style={{ fontFamily: "'Noto Sans Bengali', Arial, sans-serif" }}>
        <TableHeader>
          <TableRow className="bg-orange-600 text-white">
            <TableHead className="border border-gray-300">Item</TableHead>
            <TableHead className="border border-gray-300">Quantity</TableHead>
            <TableHead className="border border-gray-300">Unit</TableHead>
            <TableHead className="border border-gray-300 text-right price-column">Est. Price (৳)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.items.map((item: any) => (
            <TableRow key={item.id} className="hover:bg-gray-50">
              <TableCell className="border border-gray-300">{item.name}</TableCell>
              <TableCell className="border border-gray-300">{item.quantity}</TableCell>
              <TableCell className="border border-gray-300">{item.unit}</TableCell>
              <TableCell className="border border-gray-300 text-right price-column">
                {item.estimatedPrice ? formatCurrency(item.estimatedPrice, 'BDT') : '৳0.00'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-gray-100 font-bold">
            <TableCell className="border border-gray-300" colSpan={3} align="right">Total:</TableCell>
            <TableCell className="border border-gray-300 text-right price-column">
              {formatCurrency(list.totalEstimatedPrice, 'BDT')}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      
      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Printed on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default PrintPreview;
