import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Search,
} from "lucide-react";
import { motion } from "motion/react";

const FAQS = [
  {
    q: "How do I accept a ride request?",
    a: "When a ride request appears on your dashboard, you'll see the pickup and drop locations, fare, and distance. Tap ACCEPT to confirm. You have 30 seconds to accept before it's reassigned.",
  },
  {
    q: "When will I receive my payment?",
    a: "Payments are processed daily and credited to your registered bank account within 24-48 hours. Weekly payouts happen every Monday by 10 AM.",
  },
  {
    q: "How is my rating calculated?",
    a: "Your rating is the average of all passenger ratings you've received over the last 500 trips. Consistently providing a safe, polite, and clean ride will keep your rating high.",
  },
  {
    q: "What happens if a passenger cancels?",
    a: "If a passenger cancels after you've already started driving to them, you'll receive a ₹30 cancellation fee automatically. This is reflected in your daily earnings.",
  },
  {
    q: "How do I update my vehicle documents?",
    a: "Go to Profile → Vehicle Details and tap 'Update Documents'. You can upload a photo of your RC, insurance, and permit directly from your phone.",
  },
  {
    q: "What is surge pricing?",
    a: "During high demand periods (like rush hours or rain), fares increase by a multiplier (e.g., 1.5x, 2x). This means higher earnings for you on every trip during those times.",
  },
];

export function HelpPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-foreground">
          Help & Support
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get answers to common questions
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-8"
      >
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          data-ocid="help.search.input"
          placeholder="Search for help topics..."
          className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
      </motion.div>

      {/* Contact cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: <Phone size={20} />,
            title: "Call Support",
            sub: "1800-XXX-XXXX",
            sub2: "Available 24/7",
            color: "text-success",
          },
          {
            icon: <MessageCircle size={20} />,
            title: "Live Chat",
            sub: "Avg. 2 min response",
            sub2: "In-app messaging",
            color: "text-primary",
          },
          {
            icon: <Mail size={20} />,
            title: "Email Us",
            sub: "support@sarthi.in",
            sub2: "Reply within 24hr",
            color: "text-chart-3",
          },
        ].map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="card-glow rounded-2xl border border-border bg-card p-5 text-center cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div className={`${c.color} flex justify-center mb-3`}>
              {c.icon}
            </div>
            <p className="font-bold text-foreground text-sm">{c.title}</p>
            <p className="text-xs text-primary mt-1">{c.sub}</p>
            <p className="text-xs text-muted-foreground">{c.sub2}</p>
          </motion.div>
        ))}
      </div>

      {/* FAQ accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-glow rounded-2xl border border-border bg-card p-6"
        data-ocid="help.faq.panel"
      >
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle size={18} className="text-primary" />
          <h2 className="text-base font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <Badge
            className="bg-primary/20 text-primary border-primary/30 ml-auto"
            variant="outline"
          >
            {FAQS.length} Questions
          </Badge>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((faq) => (
            <AccordionItem
              key={faq.q.slice(0, 30)}
              value={faq.q.slice(0, 20)}
              className="border border-border rounded-xl px-4 bg-secondary/50"
            >
              <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary py-4 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      {/* Emergency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 flex items-center justify-between"
      >
        <div>
          <p className="font-bold text-foreground">
            Emergency? We're here 24/7
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            For safety concerns or accidents, call our emergency line
            immediately
          </p>
        </div>
        <Button className="bg-destructive text-destructive-foreground font-bold flex-shrink-0 ml-4">
          <Phone size={15} className="mr-2" /> 112
        </Button>
      </motion.div>
    </div>
  );
}
