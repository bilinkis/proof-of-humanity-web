import { useQuery } from "@kleros/components";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { graphql } from "relay-hooks";

import Delegations from "./delegations"

import { Custom404 } from "pages";

export default function ProfileDelegations() {

  const { props } = useQuery();

  const router = useRouter();
  const { query } = router;
  // const isExpired =
  //   status === submissionStatusEnum.Registered &&
  //   props?.submission &&
  //   Date.now() / 1000 - props.submission.submissionTime >
  //     props.contract.submissionDuration;


  if (props?.submission === null) {
    return <Custom404 />;
  }

  return (
    <>
      <Head>
        <title>UBI Delegations | Proof of Humanity</title>
      </Head>
      
      
      {props?.submission ? (
        <>
          <Delegations submissionID={query.id} />
        </>
      ) : null}
    </>
  );
}

export const delegationsQuery = graphql`
  query delegationsQuery($id: ID!, $_id: [String!]) {
    contract(id: 0) {
      submissionDuration
      submissionBaseDeposit
      arbitratorExtraData

      ...submissionDetailsCardContract
      ...submissionDetailsAccordionContract
    }
    submission(id: $id) {
      name
      status
      registered
      submissionTime
      disputed
      ...submissionDetailsCardSubmission
      ...submissionDetailsAccordionSubmission
    }
    vouchers: submissions(where: { vouchees_contains: $_id, usedVouch: null }) {
      ...submissionDetailsCardVouchers
    }
  }
`;
