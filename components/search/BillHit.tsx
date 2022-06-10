import { Highlight } from "@alexjball/react-instantsearch-hooks-web"
import {
  faCheckCircle,
  faMinusCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Hit } from "instantsearch.js"
import Link from "next/link"
import { useRouter } from "next/router"
import styled from "styled-components"
import { Card, Col } from "../bootstrap"

type BillRecord = {
  number: string
  title: string
  city?: string
  currentCommittee?: string
  testimonyCount: number
  primarySponsor?: string
}

const StyledCard = styled(Card)`
  border: none;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  overflow: hidden;

  cursor: pointer;
  outline-color: var(--bs-blue);
  outline-style: solid;
  outline-width: 0;
  transition: outline-width 0.1s;

  &:hover {
    outline-width: 2px;
  }

  &:active {
    outline-width: 4px;
  }

  .card-body {
    padding: 0;
  }

  .blurb {
    color: var(--bs-blue);
    font-size: 0.75rem;
  }

  .endorse {
    color: var(--bs-green);
  }
  .neutral {
    color: var(--bs-blue);
  }
  .oppose {
    color: var(--bs-orange);
  }

  .testimonyCount {
    display: flex;
    align-items: center;

    svg {
      margin-left: 0.3rem;
      margin-right: 0.2rem;
    }
  }

  .left {
    padding: 0.5rem;
    padding-right: 1rem;
  }

  .right {
    background-color: var(--bs-blue);
    color: white;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`

const TestimonyCount = ({ hit }: { hit: Hit<BillRecord> }) => {
  // TODO: use actual counts
  const count = hit.testimonyCount,
    counts = { endorse: count, oppose: count, neutral: count }

  return (
    <div className="testimonyCount">
      <FontAwesomeIcon className="endorse" icon={faCheckCircle} />
      {counts.endorse}
      <FontAwesomeIcon className="neutral" icon={faMinusCircle} />
      {counts.neutral}
      <FontAwesomeIcon className="oppose" icon={faTimesCircle} />
      {counts.oppose}
    </div>
  )
}

export const BillHit = ({ hit }: { hit: Hit<BillRecord> }) => {
  const url = `/bill?id=${hit.number}`
  const router = useRouter()

  return (
    <Link href={url}>
      <a style={{ all: "unset" }} className="w-100">
        <StyledCard>
          <Card.Body>
            <div className="d-flex">
              <Col className="left">
                <div className="d-flex justify-content-between">
                  <span className="blurb">{hit.city}</span>
                  <TestimonyCount hit={hit} />
                </div>
                <Card.Title as="h6">
                  {hit.number} - <Highlight attribute="title" hit={hit} />
                </Card.Title>
                <div className="d-flex justify-content-between">
                  {/* TODO: list other sponsors */}
                  <span className="blurb">Sponsor: {hit.primarySponsor}</span>
                  <span className="blurb ms-3">
                    {hit.currentCommittee &&
                      `Committee: ${hit.currentCommittee}`}
                  </span>
                </div>
              </Col>
              <Col xs={2} className="right">
                {/* TODO: only display if there's an actual hearing. What to show if not? */}
                Hearing Scheduled
              </Col>
            </div>
          </Card.Body>
        </StyledCard>
      </a>
    </Link>
  )
}
