import { PolicyContent } from "./PolicyContent"
import { Button, Stack, Container } from "react-bootstrap"
import { ButtonHTMLAttributes, useEffect, useState } from "react"
import style from "./PolicyPage.module.css"
import Router from "next/router"

const policies = ["copyright", "privacy-policy", "code-of-conduct"] as const
export type Policy = (typeof policies)[number]

export default function PolicyPage({
  policy = "privacy-policy"
}: {
  policy?: Policy
}) {
  const handleOnClick = (p: Policy) => {
    Router.push(`/policies/${p}`)
  }

  return (
    <Container className={style.policyContent}>
      <h1>Policies</h1>
      <Stack direction="horizontal">
        <Button
          className={`${
            style[policy === "privacy-policy" ? "currentTab" : "tab"]
          }`}
          id="privacy-policy"
          onClick={e => handleOnClick("privacy-policy")}
        >
          Privacy <br /> Policy
        </Button>
        <Button
          className={`${style[policy === "copyright" ? "currentTab" : "tab"]}`}
          id="copyright"
          onClick={e => handleOnClick("copyright")}
        >
          Terms of Service <br />
        </Button>

        <Button
          className={`${
            style[policy === "code-of-conduct" ? "currentTab" : "tab"]
          }`}
          id="code-of-conduct"
          onClick={e => handleOnClick("code-of-conduct")}
        >
          Code of <br /> Conduct
        </Button>
      </Stack>

      <PolicyContent policy={policy} />

      <div className={style.sharedValues}>
        <p className={style.subHeading}>Our Shared Values</p>
        <hr className={style.bottomBorder}></hr>
        <p className={style.text1}>
          How we interact with each other determines what we can accomplish
        </p>
        <p className={style.text2}>On this website, we ask you to act with:</p>
      </div>

      <div className={style.boxContainer}>
        <div className={style.blueBox}>
          <img
            src="handShake.jpg"
            alt="hand shake"
            className={style.symbol}
          ></img>
          <p className={style.values}>Humility</p>
        </div>
        <div className={style.blueBox}>
          <img
            src="compassion.png"
            alt="cupped hand holding heart"
            className={style.symbol}
          ></img>
          <p className={style.values}>Compassion</p>
        </div>
        <div className={style.blueBox}>
          <img
            src="lightBulb.png"
            alt="lightbulb"
            className={style.symbol}
          ></img>
          <p className={style.values}>Curiosity</p>
        </div>
      </div>
    </Container>
  )
}
