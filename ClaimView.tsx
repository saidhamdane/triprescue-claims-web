"use client";

import { useState } from "react";

export default function ClaimView() {
  const [email, setEmail] = useState("");
  const [passengerName, setPassengerName] = useState("John Doe");
  const [airline, setAirline] = useState("Ryanair");
  const [flightNumber, setFlightNumber] = useState("FR1234");
  const [route, setRoute] = useState("Madrid → Dublin");
  const [delayHours, setDelayHours] = useState("4");
  const [language, setLanguage] = useState("en");
  const [claimText, setClaimText] = useState(
    "Dear Sir or Madam, I am writing to request compensation under EU261 for my delayed flight."
  );
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendEmail = async () => {
    try {
      setSending(true);
      setMessage("");

      const res = await fetch("/api/send-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          passengerName,
          airline,
          flightNumber,
          route,
          delayHours,
          claimText,
          language,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.error || "Failed to send email");
        return;
      }

      setMessage("Email sent successfully");
    } catch (error) {
      setMessage("Something went wrong while sending the email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">TripRescue Claim</h1>

      <input
        className="w-full border rounded-lg p-3"
        type="email"
        placeholder="Traveler email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border rounded-lg p-3"
        value={passengerName}
        onChange={(e) => setPassengerName(e.target.value)}
        placeholder="Passenger name"
      />

      <input
        className="w-full border rounded-lg p-3"
        value={airline}
        onChange={(e) => setAirline(e.target.value)}
        placeholder="Airline"
      />

      <input
        className="w-full border rounded-lg p-3"
        value={flightNumber}
        onChange={(e) => setFlightNumber(e.target.value)}
        placeholder="Flight number"
      />

      <input
        className="w-full border rounded-lg p-3"
        value={route}
        onChange={(e) => setRoute(e.target.value)}
        placeholder="Route"
      />

      <input
        className="w-full border rounded-lg p-3"
        value={delayHours}
        onChange={(e) => setDelayHours(e.target.value)}
        placeholder="Delay hours"
      />

      <select
        className="w-full border rounded-lg p-3"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>

      <textarea
        className="w-full border rounded-lg p-3 min-h-[220px]"
        value={claimText}
        onChange={(e) => setClaimText(e.target.value)}
        placeholder="Claim text"
      />

      <button
        onClick={handleSendEmail}
        disabled={sending || !email}
        className="w-full bg-blue-600 text-white rounded-lg p-3 disabled:opacity-50"
      >
        {sending ? "Sending..." : "✨ Send Email"}
      </button>

      {message ? (
        <div className="border rounded-lg p-3 text-sm">{message}</div>
      ) : null}
    </div>
  );
}
