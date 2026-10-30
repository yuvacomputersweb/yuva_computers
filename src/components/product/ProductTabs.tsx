import { useState } from "react";
import { isPlaceholderSpec } from "@/lib/specs";
import { CheckCircle, ShieldCheck, Wrench, FileText } from "lucide-react";

interface ProductTabsProps {
  product: any;
  slug: string;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const allTabs = [
    { key: "description", label: "Overview" },
    { key: "specs", label: "Specifications" },
    { key: "refurbishment", label: "Refurbishment" },
    { key: "warranty", label: "Warranty" },
  ];
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="rounded-3xl border border-border p-5 md:p-8">
      {/* Tab Headers */}
      <div role="tablist" className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {allTabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`h-10 px-5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.key ? "bg-brand-navy text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "description" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="prose max-w-none text-muted-foreground">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" /> Overview
            </h4>
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
          
          {product.highlights_list?.length > 0 && (
            <div>
              <h4 className="font-bold text-foreground mb-4">Key Highlights</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {product.highlights_list.map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-muted/60 p-4 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-brand-leaf-dark shrink-0" />
                    <span className="text-sm">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "specs" && (
        <div className="grid md:grid-cols-2 gap-x-12 animate-in fade-in duration-500">
          {[
            { label: "Processor", val: product.processor },
            { label: "RAM", val: product.ram },
            { label: "Storage", val: product.storage },
            { label: "Display", val: product.display },
            { label: "Graphics", val: product.graphics },
            { label: "OS", val: product.operating_system },
            { label: "Battery", val: product.battery },
            { label: "Weight", val: product.weight },
            { label: "Ports", val: product.ports },
          ].filter((item) => !isPlaceholderSpec(item.val)).map((item, i) => (
            <p key={i} className="flex justify-between gap-6 border-b border-border py-3 text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <strong className="text-right text-foreground">{item.val}</strong>
            </p>
          ))}
        </div>
      )}

      {activeTab === "refurbishment" && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <Wrench className="text-primary" /> {product.refurbishment_summary}
          </h4>
          <ul className="space-y-2">
            {product.refurbishment_points_list?.map((p: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                <CheckCircle className="w-5 h-5 text-success shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "warranty" && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <ShieldCheck className="text-primary" /> {product.warranty_summary}
          </h4>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5 text-sm">
            {product.warranty_details_list?.map((d: string, i: number) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}