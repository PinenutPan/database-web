<template>
  <div>
    <el-form ref="form"
             :model="form"
             label-width="120px"
             label-suffix=":">
      <el-form-item label="数据源选择">
        <el-select v-model="form.type"
                   placeholder="请选择数据源">
          <el-option label="MYSQL"
                     :value="1"></el-option>
          <el-option label="ORACLE"
                     :value="2"></el-option>
        </el-select>
      </el-form-item>
      <div class="target-source">
        <el-card class="tab-box"
                 header="目标库">
            <el-form-item label="用户名"
                          required
                          prop="targetUsername">
              <el-input v-model="form.targetUsername"></el-input>
            </el-form-item>
            <el-form-item label="密码"
                          required
                          prop="targetPassword">
              <el-input v-model="form.targetPassword"></el-input>
            </el-form-item>
            <el-form-item label="url"
                          required
                          prop="targetUrl">
              <el-input v-model="form.targetUrl"
                        :placeholder="typeUrlMap[form.type]"></el-input>
            </el-form-item>
            <el-form-item label="Schema">
              <el-select v-model="form.targetSchema"
                         clearable
                         filterable
                         :disabled="!targetList.length">
                <el-option v-for="item in targetList"
                           :key="item"
                           :label="item"
                           :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-button type="primary"
                       size="mini"
                       :loading="targetLoading"
                       v-if="!targetList.length"
                       @click="targetDataBase('target')">测试</el-button>
        </el-card>
        <el-card class="tab-box"
                 header="源库">
            <el-form-item label="用户名"
                          required
                          prop="sourceUsername">
              <el-input v-model="form.sourceUsername"></el-input>
            </el-form-item>
            <el-form-item label="密码"
                          required
                          prop="sourcePassword">
              <el-input v-model="form.sourcePassword"></el-input>
            </el-form-item>
            <el-form-item label="url"
                          required
                          prop="sourceUrl">
              <el-input v-model="form.sourceUrl"
                        :placeholder="typeUrlMap[form.type]"></el-input>
            </el-form-item>
            <el-form-item label="Schema"
                          prop="sourceSchema">
              <el-select v-model="form.sourceSchema"
                         filterable
                         clearable
                         :disabled="!sourceList.length">
                <el-option v-for="item in sourceList"
                           :key="item"
                           :label="item"
                           :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-button type="primary"
                       size="mini"
                       :loading="sourceLoading"
                       v-if="!sourceList.length"
                       @click="targetDataBase('source')">测试</el-button>
        </el-card>
      </div>
    </el-form>
    <hr>
    <el-button type="primary"
               class="compare-btn"
               @click="compare"
               :disabled="!(sourceList.length && targetList.length)"
               :loading="loading">去比较</el-button>
    <div class="compare-container"
         v-loading="loading"
         v-if="count">
      <div v-if="!errorScheme">正常</div>
      <div v-for="(item, index) in errorScheme"
           :key="index">
        <div class="schema-title">{{item.schemaName}}<span v-if="item.msg">: {{item.msg}}</span></div>
        <ol class="table-list">
          <li v-for="tableItem in item.compareResultDtoList"
              :key="tableItem.tableName">{{tableItem.tableName}}: {{tableItem.msg}}</li>
        </ol>
      </div>
    </div>
  </div>
</template>
<script>
import { post } from '../assets/http'
export default {
  data () {
    return {
      targetList: [],
      sourceList: [],
      form: {
        type: 1,
        targetUsername: 'root',
        targetPassword: '55555',
        targetUrl: 'jdbc:mysql://localhost:3306',
        targetSchema: '',
        sourceSchema: '',
        sourceUrl: 'jdbc:mysql://localhost:3306',
        sourceUsername: 'root',
        sourcePassword: '55555',
        // targetUsername: '',
        // targetPassword: '',
        // targetUrl: '',
        // targetSchema: '',
        // sourceSchema: '',
        // sourceUrl: '',
        // sourceUsername: '',
        // sourcePassword: ''
      },
      typeUrlMap: {
        1: 'jdbc:mysql://{host}:{port}',
        2: 'jdbc:oracle:thin:@//{host}:{port}'
      },
      errorScheme: [],
      loading: false,
      count: 0,
      sourceLoading: false,
      targetLoading: false
    }
  },
  methods: {
    transParams (keyStr, obj) {
      let transObj = {}
      let reqArr = ['Username', 'Password', 'Url']
      reqArr.forEach(key => {
        let keyChange = key.toLowerCase()
        transObj[keyChange] = obj[`${keyStr}${key}`]
      })
      console.log(transObj);
      return transObj
    },
    /**
     * 批量校验数据
     */
    validateList (list) {
      let fieldsToValidate = list;
      return Promise.all(fieldsToValidate.map(item => {
        return new Promise((resolve) => {
          this.$refs.form.validateField(item, result => {
            resolve(result);
          })
        })
      }))
    },
    /**
     * 目标源测试
     */
    async targetDataBase (flag) {
      this[`${flag}Loading`] = true
      const result = await this.validateList([`${flag}Username`, `${flag}Url`, `${flag}Password`])
      let msg = result.find(res => { return res != '' });
      if (msg) return
      let paramsObj = { type: this.form.type, ...this.transParams(flag, this.form) }
      post('/api/dataSource/test/test', paramsObj).then(res => {
        if (res.data.connect) {
          this[`${flag}List`] = res.data.tableSchema
        }
      }).finally(() => {
        this[`${flag}Loading`] = false
      })
    },
    /**
     * 比较
     */
    compare () {
      if (!!this.form.targetSchema !== !!this.form.sourceSchema) {
        this.$message.warning('Schema需保持一致')
        return
      }
      this.count++
      this.loading = true
      this.errorScheme = []
      post('/api/database/compare/datasource', this.form).then(res => {
        this.errorScheme = res.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style scoped>
.el-button {
  display: block;
  margin: 20px auto 0;
}
.target-source {
  display: flex;
}
.tab-box {
  flex: 1;
  margin: 0 10px 0 0;
}
.el-input,
.el-select {
  width: 100%;
}
.compare-container {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  min-height: 100px;
}
.table-list {
  font-size: 14px;
}
</style>
