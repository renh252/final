'use client'

import React, { useState, useEffect } from 'react'
import ProductMenu from '../../_components/productMenu'
import styles from '../../shop.module.css'
import Card from '../../_components/card'
import Products from '../../_components/data.json'
import { FaAngleLeft,FaAngleRight } from "react-icons/fa6";

export default function PagesProductTitle({title}) {
  return (
    
    <>
      <div className={styles.header_space}></div>
      <div className={`${styles.main} ${styles.titleList}`}>
        <div className={styles.pageTitle}>
            <p className={styles.title}>商品類別</p>
            <div className="bread">
              
            </div>
        </div>
        <div className={styles.container}>
          <div className="productMenu">
            <ProductMenu/>
          </div>
          <div className={styles.subTitles}>
          <div className={styles.contain}>
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
        </div>
      </div>
    </>
  )
}
