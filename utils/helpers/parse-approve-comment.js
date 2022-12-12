/* eslint-disable indent */
const text = `
## Request Proposed
Your Datacap Allocation Request has been approved by the Notary

#### Message sent to Filecoin Network
> bafy2bzacec7gf6xycdqw3fzgs76ppn3mgtojntd5tvqrrmedvcqciw5tghjps

#### Address 
> t1rbfyvybljzd5xcouqjx22juucdj3xbwtro2crwq

#### Datacap Allocated
> 50TiB

#### Signer Address
> t1gechnbsldgbqan4q2dwjsicbh25n5xvvdzhqd3y


#### You can check the status of the message here: https://filfox.info/en/message/bafy2bzacec7gf6xycdqw3fzgs76ppn3mgtojntd5tvqrrmedvcqciw5tghjps
`

const parsedData = {}

function proposedApprovedCommentParser() {
    const data = {
        regexApproved: /##\s*Request\s*((Approved)|(Proposed))/m,
        regexAddress: /####\s*Address\W*^>\s*(.*)/m,
        regexDatacap: /####\s*Datacap\s*Allocated\W*^>\s*(.*)/m,
        regexSignerAddress: /####\s*Signer\s*Address\s*\n>\s*(.*)/m,
        regexMessage: /####\s*Message\s*sent\s*to\s*Filecoin\s*Network\s*\n>\s*(.*)/m,
    }

    for (const [key, value] of Object.entries(data)) {
        const regex = value

        const match = text.match(regex)

        if (match) {
            parsedData[key] = match[1].trim()
        }
    }
    console.log(parsedData)
}

proposedApprovedCommentParser()
