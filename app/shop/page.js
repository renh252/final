
'use client'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import styles from './shop.module.css'
// import globalStyles from '../page.module.css'
import Card from './_components/card'
import Products from './_components/data.json'
import { FaAngleLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import IconLine from './_components/icon_line'


export default function PetsPage() {
  console.log(Products);
  
  return (
    <>
      <div className={styles.banner}>
        <Image
          src="/images/Banner.jpg"
          alt="圖片描述"
          layout="responsive"
          width={100}
          height={200}
          priority
        />
        <div className={styles.banner_title}>商城</div>
      </div>
      {/* main */}
      <main className={styles.main}>
        <div className={styles.contains}>
          {/* contain */}
          <div className={styles.contain}>
            <div className={styles.contain_title}>
              <IconLine key={'8折優惠區'} title={'8折優惠區'}/>
            </div>
            <div className={styles.group}>
                <div className={styles.groupBody}>
                  <div className={styles.angle}>
                    <FaAngleLeft/>
                  </div>
                  <div className={styles.cardGroup}>
                    {Products.map((product) => {
                      return(
                        <Card
                          key={product.id}
                          image={product.image}
                          title={product.title}
                          description={product.description}
                          price={product.price}
                        />
                      )
                    })}
                  </div>
                  <div className={styles.angle}>
                    <FaAngleRight/>
                  </div>
                </div>
              </div>
          </div>

          {/* contain */}
          <div className={styles.contain}>
            <div className={styles.contain_title}>
              <IconLine key={'title'} title={'title'}/>
            </div>
            <div className={styles.contain_body}>
              {/* subTitle */}
              <div className={styles.group}>
                <div className={styles.groupTitle}>
                  <p>subTitle</p>
                </div>
                <div className={styles.groupBody}>
                  <div className={styles.angle}>
                    <FaAngleLeft/>
                  </div>
                  <div className={styles.cardGroup}>
                    {Products.map((product) => {
                      return(
                        <Card
                          key={product.id}
                          image={product.image}
                          title={product.title}
                          description={product.description}
                          price={product.price}
                        />
                      )
                    })}
                  </div>
                  <div className={styles.angle}>
                    <FaAngleRight/>
                  </div>
                </div>
              </div>
              <div className={styles.group}>
                <div className={styles.groupTitle}>
                  <p>subTitle</p>
                </div>
                <div className={styles.groupBody}>
                  <div className={styles.angle}>
                    <FaAngleLeft/>
                  </div>
                  <div className={styles.cardGroup}>
                    {Products.map((product) => {
                      return(
                        <Card
                          key={product.id}
                          image={product.image}
                          title={product.title}
                          description={product.description}
                          price={product.price}
                        />
                      )
                    })}
                  </div>
                  <div className={styles.angle}>
                    <FaAngleRight/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
<IconLine key={'title'} title={'title'}/>
    </>
  )
}

// https://tse3.mm.bing.net/th?id=OIP.qtqz5bqN6loOFszu011VIgHaE8&pid=Api&P=0&h=180
