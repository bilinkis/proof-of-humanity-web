import {Text, useWeb3} from "@kleros/components";
export default function Delegations({
  submissionID
}) {
  const { web3 } = useWeb3();
  console.log(web3)
  return (
      <Text>{submissionID}</Text>
  )
}
