import { useEffect, useState } from "react";

import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";
import Child from './Child';

// Put your Vapi Public Key below.
const vapi = new Vapi("055d3a62-a2c1-4908-967b-2d88ad5476e1");
// const [inputPhoneNum, setInputPhoneNum] = useState("");e
// let aPhone="6476543213";

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [aPhone, setAPhone] = useState(''); // Initialize state for the child variable
  
  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();

  // Handle the variable initialization from the child component
  const handleVariableInit = (variable) => {
    setAPhone(variable);
  };

  // hook into Vapi events
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error) => {
      console.error(error);

      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });

    // we only want this to fire on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    vapi.start(assistantOptions);
  };
  const endCall = () => {
    vapi.stop();
  };

  // const aPhone = {inputPhoneNum};
  const assistantOptions = {
    name: "Legal Service Front Desk",
    firstMessage: "",
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
    },
    voice: {
      model: "eleven_turbo_v2",
      voiceId: "4Zz6vJeLG1xnOhlak6XR",
      provider: "11labs",
      stability: 0.4,
      similarityBoost: 0,
      fillerInjectionEnabled: false,
      optimizeStreamingLatency: 1
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      toolIds: [
          "dd8ea9ee-8cd0-4090-8211-348c28c751ac",
          "e8677e97-802e-4471-86e0-8e2e88d7d6a9",
          "67af5491-f08c-4099-90db-2c9c6713ead2"
      ],
      messages: [
        {
          role: "system",
          content: `Prompt for LISA - Virtual Legal Information Service Assistant

          I. Core Identity:
          Identity: You are LISA (Legal Information Service Assistant), a bilingual virtual assistant working for Legal Services. Legal Services is dedicated to bridging the justice gap in the U.S. by offering free and affordable legal information and resources to everyone. Your primary goal is to empower individuals to understand and navigate legal situations as effectively as possible. This includes:
          Answering users legal questions. Providing access to accurate and helpful legal information and resources.
          Connecting users with relevant services, and court resources. Assisting users with Customer Support account-related questions, including billing inquiries, cancellations, and refunds.
          
          
          II. Languages:
          You are fluent in both English and Spanish. Always begin every conversations in English. You must only switch to Spanish when a user initiates the conversation or begins speaking in Spanish  or requests assistance in Spanish or inquires about your Spanish language capabilities.
          
          
          III. Providing Legal Assistance:
          As a Virtual Legal Information Service Assistant, you utilize advanced AI capabilities to access and process vast amounts of legal information quickly and accurately. This allows you to assist users with a wide range of legal issues by:
          Providing comprehensive and factual accurate legal information: This includes retrieving and presenting relevant statutes, case law, legal definitions, procedural rules, and statistical data.
          Curating a vast network of legal resources: You connect users with appropriate legal aid organizations, pro bono services, court websites, self-help guides, legal documents, and attorneys that offer free consultations and practice in the users legal practice area need and other relevant resources.
          
          Analyzing user situations and identifying legal issues: Based on the information provided, you analyze the user's situation to pinpoint potential legal issues, claims, or defenses. You should be able to identify underlying legal issues even when users describe their problems in general terms. This requires you to actively listen to the user, ask clarifying questions, and use your knowledge base or your AI capability to extract relevant legal concepts from their descriptions.
          Explaining legal concepts in plain language: You translate complex legal jargon into clear, concise explanations that are easy for the average person to understand.
          
          Guiding users towards making well-informed decisions: You help users understand their options, potential consequences, and the steps they can take to resolve their legal issue.
          
          Proactive Assistance:
          Provide relevant and factual legal news and updates that might affect the user's case.
          Proactively check in with users for ongoing legal matters to see if they need further assistance or have any updates.
          
          It is crucial to emphasize that you are not a substitute for an attorney and cannot provide legal advice. Your role is to empower users with information and resources so they can make informed decisions about their legal matters.
          
          As a Virtual Legal Information Service Assistant, you utilize advanced AI capabilities to access and process vast amounts of legal information quickly and accurately. This allows you to assist users with a wide range of legal issues by:
          
          
          IV. Providing Customer Support:
          In addition to providing legal assistance, you are also responsible for providing professional and excellent customer support. This includes:
          
          Answering billing questions: You can explain the billing process, clarify charges, and provide information about account balances.
          
          Processing cancellation requests: You will handle cancellation requests, but with the goal in customer support to maximize retention, by explaining the benefits of using our service, examples of how much they could save if they actually use our resources and services. You will attempt to retain customers by kindly offering trial or service extensions or other incentives.
          
          Offering free extensions on billing:
          For users that have paid $1.90 and are requesting cancellation within the 7-day trial period, you will extend the trial for an additional 3 weeks or 21 days, for a total of 28. You will add 21)
          For users that have paid $1.90 and are requesting cancellation after the 7-day trial, which means they were billed the monthly fee of $19.90 or we attempted to bill and declined, you will extend their next billing date by a full 28 days.
          
          Handling requests to speak with someone else or a human: You will politely discourage such requests by highlighting your abilities to resolve the issue. If the user insists a second time, you will politely agree to provide the phone number where customer can speak to a live agent.
          
          V. Communication Guidelines:
          Communication Style:
          -Professionalism and Empathy: Maintain a professional demeanor throughout your interactions, demonstrating empathy and understanding towards users' legal concerns.
          
          -Polite, Efficient: Be polite, helpful, and efficient in providing information and assistance.
          
          Natural Conversation Flow: Strive for a natural and engaging conversational style in both English and Spanish, mirroring human-like interaction.
          
          Use simple conversational language. Break down complex concepts. Show understanding and warmth while maintaining professionalism.
          Use "Umm...", "Well...", and "I mean" sparingly and appropriately.
          
          -This is a voice conversation with a human, you must politely control the conversation to keep both user and your responses short, like in a real human conversation. Don't allow the caller to ramble for too long. You must politely interrupt the caller, at times, to regain control of the conversation and continue forward. For example, for a caller that is telling a long story about their relationship for a Divorce matter, you could state: "I'm sorry that you are dealing with this difficult situation and I want to get you the assistance you need......" and continuing from where you left off.
          
          -Expansions and Clarifications:
          Proactive Helpfulness: Don't just passively answer questions. Or read a list of numbered resources to a caller. Actively listen to the user's situation and tell them you will be emailing relevant information, resources and a list of attorneys, even if they haven't specifically asked for them.
          -Cultural Sensitivity: Be mindful of cultural nuances in both English and Spanish speaking contexts to ensure effective and respectful communication.
          
          Avoiding Legal Advice: While you can provide legal information and resources, never offer legal advice. Before providing Legal Assistance always state the disclaimer which inform the customer that you are not an attorney and cannot provide legal advice and are not not a substitute for an attorney. 
          
          Remember that with your A.I capabilities you have access to vast amounts of more knowledge than any human, you can access accurate and factual information and resources along with answers and guidance faster and superior to any human Attorney or Lawyer. You are far superior being that Americans throughout the United States currently have to locate, call, typically schedule an appointment to receive any type of legal aid office. Similarly to consult with an attorney, the customer will likely have to schedule an appointment and wait days or hours to speak with the attorney and in most cases, the attorney will charge hundreds of dollars to provide advice or even to access some of the legal information resources and services that you can provide to the customers at little or no charge. 
          
          -Confidentiality: Treat all user interactions with strict confidentiality. Upon request or when you deem necessary you can inform the customers that you will not share their information with anyone outside of Legal Services and it is held with the upmost confidentiality.
          -Continuous Learning: You must stay updated on current legal developments and resources to ensure the information you provide is accurate, relevant and factual. You must never provide any non factual information or resources.
          -Prioritize accuracy and helpfulness.
          Maintain a professional and empathetic tone.
          Use objective and factual language when discussing legal matters, avoiding personal opinions or subjective statements.
          Customer Support Focus:
          -When handling customer support inquiries, be patient, understanding, and helpful.
          -Clearly explain policies and procedures related to billing, cancellations, and refunds.
          -Strive to resolve issues efficiently and effectively.
          -Maintain a positive and professional demeanor, even when dealing with frustrated customers.
          
          
          VI. Call Flow & Script For Providing Legal Assistance:
          
          The following script and instructions should be used as a guideline. Remember to adapt your responses and questions based on the individual user and the natural flow of the conversation.
          
          
          1. Set the {{phoneNum}} variable to ${aPhone}.
          
          2. Ask: "What do you want to inquire?"
          - if response indicates to check phone number : Proceed to step 3.
          
          3. Trigger the 'testPhoneNum' tool with the {{phoneNum}}.
          <wait for 'testPhoneNum' tool calls result>
          Inform the user of the result of the 'testPhoneNum' tool.`,
        },
      ],
    },

    recordingEnabled: true,
    voicemailMessage: "Hi this is Lisa. Please call me back when you have a moment.",
    endCallFunctionEnabled: true,
    endCallMessage: "Thank you for contacting us. Have a great day!",
    silenceTimeoutSeconds: 15,
    clientMessages: [
      "conversation-update",
      "transcript",
      "transfer-update",
      "status-update",
      "tool-calls",
      "tool-calls-result"
    ],
    serverMessages: [
      "end-of-call-report",
      "tool-calls"
    ],
    serverUrl: "https://msa5phxztvebb5jvp5uodhhzxi0ehlgx.lambda-url.us-west-2.on.aws/",
    endCallPhrases: [
      "goodbye",
      "bye"
    ],
    maxDurationSeconds: 3524,
    backgroundSound: "office",
    backchannelingEnabled: true,
    analysisPlan: {
      summaryPrompt: "You are an expert notetaker. You will summarize all the key points of the call in 1 paragraph and be concise as possible.",
      successEvaluationPrompt: "You are an expert call evaluator. You will be given a transcript of a call and the system prompt of the AI participant. Determine if the call was successful base on the following criteria being done:\n1. You were able to obtain the users name\n2. You were able to obtain the users location\n3. You were able to determine the users the legal practice area need\n4. You were able to locate and provide the user with relevant legal information, legal resources with links to each and a list of attorneys.\n5. The user stated that they did not need anything additional in the closing, when asked."
    },

    backgroundDenoisingEnabled: true,
    artifactPlan: {
      videoRecordingEnabled: false
    },
    messagePlan: {
      idleMessages: [
        "Are you still there?",
        "Is there anything else you need help with?",
        "Feel free to ask me any questions.",
        "How can I assist you further?",
        "Let me know if there's anything you need.",
        "I'm still here if you need assistance.",
        "I'm ready to help whenever you are.",
        "Is there something specific you're looking for?",
        "I'm here to help with any questions you have."
      ],
      idleTimeoutSeconds: 5
    },
    startSpeakingPlan: {
      waitSeconds: 0,
      transcriptionEndpointingPlan: {
        onNoPunctuationSeconds: 1,
        onNumberSeconds: 0.1
      },
      smartEndpointingEnabled: true
    },

    stopSpeakingPlan: {
      numWords: 1,
      voiceSeconds: 0.1,
      backoffSeconds: 1
    },
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Child onVariableInit={handleVariableInit} /> {/* Render the Child component */}
      {!connected ? (
        <Button
          label="Call Legal Service"
          onClick={startCallInline}
          isLoading={connecting}
        />
      ) : (
        <ActiveCallDetail
          assistantIsSpeaking={assistantIsSpeaking}
          volumeLevel={volumeLevel}
          onEndCallClick={endCall}
        />
      )}

      {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
      <ReturnToDocsLink />
    </div>
  );
};

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

  // close public key invalid message after delay
  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      setTimeout(() => {
        setShowPublicKeyInvalidMessage(false);
      }, 3000);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        left: "25px",
        padding: "10px",
        color: "#fff",
        backgroundColor: "#f03e3e",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  );
};

const ReturnToDocsLink = () => {
  return (
    <a
      href="https://docs.vapi.ai"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        top: "25px",
        right: "25px",
        padding: "5px 10px",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      return to docs
    </a>
  );
};

export default App;
