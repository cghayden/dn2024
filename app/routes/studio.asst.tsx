import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { openai } from "~/lib/openaiConfig";

// export async function loader({ request }: LoaderFunctionArgs) {

// }

export default function StudioAssistant() {
  // const data = useLoaderData();
  // console.log("data", data);
  return (
    <div>
      <h1>Studio Assistant</h1>
    </div>
  );
}
