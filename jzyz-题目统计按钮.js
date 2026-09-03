// ==UserScript==
// @name         jzyz-题目统计按钮
// @version      1.0
// @description  在题目详情页添加“统计”按钮，跳转至该题的统计页面
// @author       User
// @match        *://172.20.6.60/*
// @match        *://ng:code-fans.cn:5678/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  var url = window.location.href;

  async function addStatisticsButton() {
      // 提取域名和题号 (例如 liyue 和 abc153eL)
      const match = url.match(/\/d\/([^\/]+)\/p\/([^\/\?]+)/);
      if (!match) return;
      const domain = match[1];
      const pid = match[2];

      // 构造统计页面链接，注意去掉后面的 tid 参数，保持纯净
      const statUrl = `/d/${domain}/p/${pid}/stat`;

      // 创建按钮元素，严格参照用户提供的模板
      const li = document.createElement('li');
      li.className = 'menu__item';

      const a = document.createElement('a');
      a.className = 'menu__link';
      a.href = statUrl; // 动态设置链接

      const span = document.createElement('span');
      span.className = 'icon icon-statistics';

      const text = document.createTextNode('统计');

      a.appendChild(span);
      a.appendChild(text);
      li.appendChild(a);

      // 查找“递交”按钮，并将新按钮插入到其下方
      const menu = document.querySelector('.menu');
      if (menu) {
          const submitItem = [...document.querySelectorAll('.menu__item')].find(el => el.textContent.includes('递交'));
          if (submitItem && submitItem.parentNode) {
              submitItem.parentNode.insertBefore(li, submitItem.nextSibling);
          } else {
              // 找不到“递交”就直接追加到最下方
              menu.appendChild(li);
          }
      }
  }

  // 检查页面环境，确保是题目详情页
  function checkUiContext() {
      const allScript = document.querySelectorAll('script');
      for (const node of allScript) {
          if (node.textContent.includes('UiContext')) {
              return true;
          }
      }
      return false;
  }

  const pageInfo = document.querySelector('html');
  if (pageInfo) {
      const dataPage = pageInfo.getAttribute('data-page');
      if (dataPage && checkUiContext() && (dataPage === "problem_detail" || dataPage.includes("detail_problem"))) {
          window.addEventListener('load', addStatisticsButton);
      }
  }
})();