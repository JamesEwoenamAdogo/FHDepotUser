import { useState, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Briefcase, Upload, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const jobData = {
  "operations-manager": {
    title: "Operations Manager",
    location: "Accra, Ghana",
    type: "Full-time",
    description:
      "We are looking for an experienced Operations Manager to oversee our daily distribution operations, ensuring efficiency and compliance.",
    requirements: [
      "Minimum 5 years of experience in FMCG operations or logistics.",
      "Strong leadership and team management skills.",
      "Excellent problem-solving and analytical abilities.",
      "Proficiency in supply chain management software.",
    ],
  },
  "stocks-manager": {
    title: "Stocks Manager",
    location: "Accra, Ghana",
    type: "Full-time",
    description:
      "The Stocks Manager will be responsible for maintaining accurate inventory levels, conducting audits, and managing warehouse stock.",
    requirements: [
      "Minimum 3 years of experience in inventory management.",
      "Detail-oriented with strong organizational skills.",
      "Experience with inventory tracking systems.",
      "Ability to work in a fast-paced environment.",
    ],
  },
  "warehouse-manager": {
    title: "Warehouse Manager",
    location: "Accra, Ghana",
    type: "Full-time",
    description:
      "Seeking a Warehouse Manager to direct receiving, warehousing, and distribution operations.",
    requirements: [
      "Proven work experience as a Warehouse Manager.",
      "Expertise in warehouse management procedures and best practices.",
      "Strong knowledge of warehousing Key Performance Indicators (KPIs).",
      "Excellent communication skills.",
    ],
  },
  cashier: {
    title: "Cashier",
    location: "Accra, Ghana",
    type: "Full-time",
    description:
      "We need a reliable Cashier to process transactions accurately and efficiently while providing excellent customer service.",
    requirements: [
      "Previous experience as a Retail Cashier or in a similar role.",
      "Basic PC knowledge and familiarity with electronic equipment (e.g. cash register, scanners, money counters).",
      "Strong math skills.",
      "Good communication and time management skills.",
    ],
  },
  driver: {
    title: "Driver",
    location: "Accra, Ghana",
    type: "Full-time",
    description:
      "Looking for a responsible Delivery Driver to distribute products promptly to our customers.",
    requirements: [
      "Valid professional driver’s license.",
      "Proven experience as a Delivery Driver.",
      "Excellent organizational and time management skills.",
      "Good driving record with no traffic violations.",
    ],
  },
  loader: {
    title: "Loader",
    location: "Accra, Ghana",
    type: "Full-time",
    description:
      "The Loader will be responsible for loading and unloading delivery vehicles, organizing warehouse stock, and ensuring safe handling of products.",
    requirements: [
      "Ability to lift heavy objects safely.",
      "Good physical stamina and strength.",
      "Basic understanding of warehouse safety guidelines.",
      "Team player with a strong work ethic.",
    ],
  },
};

type JobKey = keyof typeof jobData;

const Careers = () => {
  const [selectedJob, setSelectedJob] = useState<JobKey | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openApply = (slug: JobKey) => {
    setSelectedJob(slug);
    setName("");
    setEmail("");
    setPhone("");
    setCvFile(null);
  };

  const closeApply = () => setSelectedJob(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload your CV in PDF format.",
        variant: "destructive",
      });
      return;
    }
    setCvFile(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !cvFile) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload your CV.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      closeApply();
      toast({
        title: "Application submitted",
        description: "Thank you for applying. Our team will reach out to you.",
      });
    }, 800);
  };

  const job = selectedJob ? jobData[selectedJob] : null;

  return (
    <div className="min-h-screen bg-fh-gray py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-fh-navy mb-6">
            Build Your Career With FH Depot
          </h1>
          <p className="text-xl text-gray-600">
            Join one of Ghana’s fast-growing FMCG distribution companies and
            help shape the future of supply and logistics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {Object.entries(jobData).map(([slug, job]) => (
            <div
              key={slug}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
            >
              <h3 className="text-2xl font-bold text-fh-navy mb-3">
                {job.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> {job.type}
                </span>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-fh-navy mb-2">
                  About the Role
                </h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {job.description}
                </p>
              </div>

              <div className="mt-auto">
                <h4 className="font-semibold text-fh-navy mb-2">
                  Requirements
                </h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm mb-6">
                  {job.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
                <Button
                  className="bg-fh-orange hover:bg-fh-orangeHover text-white w-full"
                  onClick={() => openApply(slug as JobKey)}
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog
          open={selectedJob !== null}
          onOpenChange={(open) => !open && closeApply()}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-fh-navy">
                {job?.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {job?.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> {job?.type}
                </span>
              </DialogDescription>
            </DialogHeader>

            {job && (
              <div className="space-y-6 mt-2">
                <div>
                  <h4 className="font-semibold text-fh-navy mb-2">
                    About the Role
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {job.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-fh-navy mb-2">
                    Requirements
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="apply-name">Full Name</Label>
                    <Input
                      id="apply-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apply-email">Email Address</Label>
                    <Input
                      id="apply-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apply-phone">Phone Number</Label>
                    <Input
                      id="apply-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apply-cv">CV (PDF only)</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {cvFile ? "Change file" : "Upload CV"}
                      </Button>
                      {cvFile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="truncate max-w-[200px]">
                            {cvFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCvFile(null)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        id="apply-cv"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-fh-orange hover:bg-fh-orangeHover text-white w-full"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Careers;
