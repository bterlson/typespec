import * as ay from "@alloy-js/core";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";
import { EnglishOperation } from "./operation.js";

export interface ClientProps {
  client: Client;
}

export function EnglishClient(props: ClientProps) {
  return (
    <ay.SourceFile path={$.client.getName(props.client)} filetype="txt">
      Hello, I am a client "{$.client.getName(props.client)}"
      <ay.Indent>
        <EnglishOperation client={props.client} operation={$.client.getConstructor(props.client)} />
      </ay.Indent>
    </ay.SourceFile>
  );
}
