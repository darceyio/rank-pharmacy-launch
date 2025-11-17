import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FAQ = () => {
  const faqData = [
    {
      category: "Getting started",
      items: [
        {
          question: "How do I register with Rank Pharmacy?",
          answer:
            "You can create your Rank Pharmacy account today by either downloading our mobile app, or registering here on our website, and logging in with your NHS login account.",
        },
        {
          question: "Can I access my account from multiple devices?",
          answer: "Yes, you can log in from any device with your NHS login.",
        },
      ],
    },
    {
      category: "Prescriptions",
      items: [
        {
          question: "Can I order repeat prescriptions?",
          answer:
            "Yes, once registered you can request repeat prescriptions from your dashboard.",
        },
        {
          question: "How long does prescription processing take?",
          answer:
            "Most prescriptions are processed within 48 hours. You'll receive a notification when your prescription is ready for collection or delivery.",
        },
      ],
    },
  ];

  return (
    <section className="section-spacing container-padding">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="italic">Questions</span>
          </h2>
          <p className="text-lg text-secondary">
            Everything you need to know about managing your health with Rank Pharmacy.
          </p>
        </div>

        <Tabs defaultValue="Getting started" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            {faqData.map((category) => (
              <TabsTrigger key={category.category} value={category.category}>
                {category.category}
              </TabsTrigger>
            ))}
          </TabsList>

          {faqData.map((category) => (
            <TabsContent key={category.category} value={category.category}>
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-lg font-semibold">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-secondary text-base">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default FAQ;
